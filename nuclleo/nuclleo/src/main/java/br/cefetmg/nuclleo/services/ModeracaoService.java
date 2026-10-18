package br.cefetmg.nuclleo.services;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.AcaoModeracaoRequestDTO;
import br.cefetmg.nuclleo.dto.NotificacaoDTO;
import br.cefetmg.nuclleo.dto.SuspensaoRequestDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Denuncia;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Sancao;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.StatusDenuncia;
import br.cefetmg.nuclleo.model.TipoAlvo;
import br.cefetmg.nuclleo.model.TipoSancao;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.DenunciaRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.MensagemRepository;
import br.cefetmg.nuclleo.repository.SancaoRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;

/**
 * Concentra todas as mudanças de status de contas e anúncios:
 * suspender, reativar e excluir (exclusão lógica).
 *
 * Regras gerais:
 * - Suspensão: de 1 a 7 dias, escolhidos pelo administrador. Contas também podem
 *   ser suspensas permanentemente (suspensoAte = null): só voltam se um admin reativar.
 * - EXCLUIDO é definitivo: nunca mais volta a ATIVO ou SUSPENSO.
 * - Suspender ou excluir apaga todos os interesses e conversas ligados ao alvo.
 * - Administradores não podem ser suspensos nem excluídos pela moderação.
 */
@Service
public class ModeracaoService {

    public static final int DIAS_MINIMO_SUSPENSAO = 1;
    public static final int DIAS_MAXIMO_SUSPENSAO = 7;

    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AnuncioRepository anuncioRepository;

    @Autowired
    private InteresseRepository interesseRepository;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private AnuncioComunidadeRepository anuncioComunidadeRepository;

    @Autowired
    private SancaoRepository sancaoRepository;

    @Autowired
    private DenunciaRepository denunciaRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private ComunidadeService comunidadeService;

    @Autowired
    private UsuarioComunidadeService usuarioComunidadeService;

    // =====================================================================
    // CONTA DE USUÁRIO
    // =====================================================================

    @Transactional
    public Sancao suspenderUsuario(Long cdUsuario, SuspensaoRequestDTO dto, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Usuario usuario = buscarUsuario(cdUsuario);

        validarAlvoUsuario(usuario);
        boolean permanente = dto.isPermanente();
        if (!permanente) {
            validarDias(dto.getDias());
        }

        Denuncia denuncia = marcarDenunciaProcedente(dto.getCdDenuncia(), usuario, null, admin);

        // Permanente: sem data de fim, então a rotina agendada nunca reativa sozinha
        LocalDateTime fim = permanente ? null : LocalDateTime.now().plusDays(dto.getDias());
        Integer dias = permanente ? null : dto.getDias();

        limparInteressesDoUsuario(usuario);

        // Banimento permanente: as comunidades dele são apagadas e ele sai das comunidades
        // de outros usuários. Na suspensão por tempo, tudo isso fica como está
        if (permanente) {
            excluirComunidadesDoUsuario(usuario);
            usuarioComunidadeService.excluirPorUsuario(usuario.getCdUsuario());
        }

        usuario.setStatus(Status.SUSPENSO);
        usuario.setSuspensoAte(fim);
        usuarioRepository.save(usuario);

        Sancao sancao = registrarSancao(TipoAlvo.USUARIO, usuario, null, TipoSancao.SUSPENSAO,
                dias, fim, admin, denuncia);

        notificar(usuario.getCdUsuario(), "CONTA_SUSPENSA", permanente
                ? "Sua conta foi suspensa permanentemente."
                : "Sua conta foi suspensa até " + fim.format(FORMATO_DATA) + ".");

        return sancao;
    }

    @Transactional
    public Sancao reativarUsuario(Long cdUsuario, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Usuario usuario = buscarUsuario(cdUsuario);

        if (usuario.getStatus() != Status.SUSPENSO) {
            throw new BusinessException("Somente contas suspensas podem ser reativadas.");
        }

        usuario.setStatus(Status.ATIVO);
        usuario.setSuspensoAte(null);
        usuarioRepository.save(usuario);

        return registrarSancao(TipoAlvo.USUARIO, usuario, null, TipoSancao.REATIVACAO,
                null, null, admin, null);
    }

    @Transactional
    public Sancao excluirUsuarioPeloAdmin(Long cdUsuario, AcaoModeracaoRequestDTO dto, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Usuario usuario = buscarUsuario(cdUsuario);

        validarAlvoUsuario(usuario);

        Denuncia denuncia = marcarDenunciaProcedente(dto.getCdDenuncia(), usuario, null, admin);

        excluirConta(usuario);

        return registrarSancao(TipoAlvo.USUARIO, usuario, null, TipoSancao.EXCLUSAO,
                null, null, admin, denuncia);
    }

    /** O próprio usuário excluindo a conta dele. */
    @Transactional
    public Usuario excluirContaPeloProprioUsuario(Long cdUsuario, String emailSolicitante) {
        Usuario usuario = buscarUsuario(cdUsuario);

        if (!usuario.getEmail().equalsIgnoreCase(emailSolicitante)) {
            throw new ForbiddenException("Você só pode excluir a sua própria conta.");
        }

        excluirConta(usuario);
        return usuario;
    }

    /**
     * Exclusão lógica da conta:
     * - todos os anúncios da conta passam para EXCLUIDO (com a limpeza de interesses);
     * - os interesses que o usuário fez em anúncios de outros são apagados;
     * - as comunidades que ele criou são apagadas; os anúncios de outros usuários
     *   que estavam nelas só perdem o vínculo (continuam ativos);
     * - ele deixa de ser membro das comunidades de outros usuários;
     * - o e-mail é trocado por um valor único e inválido, liberando o e-mail
     *   original para um novo cadastro no futuro;
     * - dados pessoais (CPF, foto) são apagados e a senha é invalidada.
     * Nome, transações e avaliações continuam existindo para manter o histórico.
     */
    private void excluirConta(Usuario usuario) {
        if (usuario.getStatus() == Status.EXCLUIDO) {
            throw new BusinessException("Esta conta já foi excluída.");
        }

        List<Anuncio> anuncios = anuncioRepository.findByUsuarioCria_CdUsuario(usuario.getCdUsuario());
        for (Anuncio anuncio : anuncios) {
            if (anuncio.getStatus() != Status.EXCLUIDO) {
                excluirAnuncioInterno(anuncio);
            }
        }

        limparInteressesDoUsuario(usuario);

        excluirComunidadesDoUsuario(usuario);
        usuarioComunidadeService.excluirPorUsuario(usuario.getCdUsuario());

        usuario.setStatus(Status.EXCLUIDO);
        usuario.setSuspensoAte(null);
        usuario.setEmail("excluido_" + usuario.getCdUsuario() + "@nuclleo.invalid");
        usuario.setCpf(null);
        usuario.setFtUsuario(null);
        usuario.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
        usuarioRepository.save(usuario);
    }

    // Apaga as comunidades que o usuário criou (vínculos com anúncios, membros e chat vão junto).
    // Os anúncios que estavam nelas só perdem o vínculo, sem serem inativados.
    private void excluirComunidadesDoUsuario(Usuario usuario) {
        List<Comunidade> comunidades = comunidadeRepository.findByUsuarioCria_CdUsuario(usuario.getCdUsuario());
        for (Comunidade comunidade : comunidades) {
            comunidadeService.excluir(comunidade.getCdComunidade());
        }
    }

    // =====================================================================
    // ANÚNCIO
    // =====================================================================

    @Transactional
    public Sancao suspenderAnuncio(Long cdAnuncio, SuspensaoRequestDTO dto, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Anuncio anuncio = buscarAnuncio(cdAnuncio);

        if (anuncio.getStatus() == Status.EXCLUIDO) {
            throw new BusinessException("Este anúncio já foi excluído.");
        }
        if (dto.isPermanente()) {
            throw new BusinessException("Anúncios não têm suspensão permanente. Para isso, exclua o anúncio.");
        }
        validarDias(dto.getDias());

        Usuario dono = anuncio.getUsuarioCria();
        Denuncia denuncia = marcarDenunciaProcedente(dto.getCdDenuncia(), dono, anuncio, admin);

        LocalDateTime fim = LocalDateTime.now().plusDays(dto.getDias());

        limparInteressesDoAnuncio(anuncio);

        anuncio.setStatus(Status.SUSPENSO);
        anuncio.setSuspensoAte(fim);
        anuncioRepository.save(anuncio);

        Sancao sancao = registrarSancao(TipoAlvo.ANUNCIO, dono, anuncio, TipoSancao.SUSPENSAO,
                dto.getDias(), fim, admin, denuncia);

        notificar(dono.getCdUsuario(), "ANUNCIO_SUSPENSO",
                "Seu anúncio \"" + anuncio.getNmAnuncio() + "\" foi suspenso até " + fim.format(FORMATO_DATA) + ".");

        return sancao;
    }

    @Transactional
    public Sancao reativarAnuncio(Long cdAnuncio, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Anuncio anuncio = buscarAnuncio(cdAnuncio);

        if (anuncio.getStatus() != Status.SUSPENSO) {
            throw new BusinessException("Somente anúncios suspensos podem ser reativados.");
        }

        anuncio.setStatus(Status.ATIVO);
        anuncio.setSuspensoAte(null);
        anuncioRepository.save(anuncio);

        return registrarSancao(TipoAlvo.ANUNCIO, anuncio.getUsuarioCria(), anuncio, TipoSancao.REATIVACAO,
                null, null, admin, null);
    }

    @Transactional
    public Sancao excluirAnuncioPeloAdmin(Long cdAnuncio, AcaoModeracaoRequestDTO dto, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Anuncio anuncio = buscarAnuncio(cdAnuncio);

        if (anuncio.getStatus() == Status.EXCLUIDO) {
            throw new BusinessException("Este anúncio já foi excluído.");
        }

        Usuario dono = anuncio.getUsuarioCria();
        Denuncia denuncia = marcarDenunciaProcedente(dto.getCdDenuncia(), dono, anuncio, admin);

        excluirAnuncioInterno(anuncio);

        Sancao sancao = registrarSancao(TipoAlvo.ANUNCIO, dono, anuncio, TipoSancao.EXCLUSAO,
                null, null, admin, denuncia);

        notificar(dono.getCdUsuario(), "ANUNCIO_EXCLUIDO",
                "Seu anúncio \"" + anuncio.getNmAnuncio() + "\" foi removido pela moderação.");

        return sancao;
    }

    /** O dono excluindo o próprio anúncio. */
    @Transactional
    public Anuncio excluirAnuncioPeloDono(Long cdAnuncio, String emailSolicitante) {
        Anuncio anuncio = buscarAnuncio(cdAnuncio);

        if (anuncio.getStatus() == Status.EXCLUIDO) {
            throw new ResourceNotFoundException("Anúncio não encontrado.");
        }

        if (!anuncio.getUsuarioCria().getEmail().equalsIgnoreCase(emailSolicitante)) {
            throw new ForbiddenException("Você só pode excluir os seus próprios anúncios.");
        }

        excluirAnuncioInterno(anuncio);
        return anuncio;
    }

    /** Exclusão lógica: EXCLUIDO + apaga interesses, conversas e vínculos com comunidades. */
    private void excluirAnuncioInterno(Anuncio anuncio) {
        limparInteressesDoAnuncio(anuncio);
        anuncioComunidadeRepository.deleteByAnuncioCdAnuncio(anuncio.getCdAnuncio());

        anuncio.setStatus(Status.EXCLUIDO);
        anuncio.setSuspensoAte(null);
        anuncioRepository.save(anuncio);
    }

    // =====================================================================
    // HISTÓRICO
    // =====================================================================

    /** Histórico de sanções de um usuário (inclui as sanções dos anúncios dele). */
    @Transactional(readOnly = true)
    public List<Sancao> listarSancoesDoUsuario(Long cdUsuario) {
        buscarUsuario(cdUsuario);
        return sancaoRepository.findByUsuario_CdUsuarioOrderByDtInicioDesc(cdUsuario);
    }

    /** Sanções aplicadas pelo administrador logado (perfil do admin). */
    @Transactional(readOnly = true)
    public List<Sancao> listarSancoesAplicadas(String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        return sancaoRepository.findByAdmin_CdUsuarioOrderByDtInicioDesc(admin.getCdUsuario());
    }

    // =====================================================================
    // ROTINA AGENDADA: reativa suspensões vencidas (a cada 10 minutos)
    // =====================================================================

    @Scheduled(fixedRate = 10 * 60 * 1000)
    @Transactional
    public void reativarSuspensoesVencidas() {
        LocalDateTime agora = LocalDateTime.now();

        List<Usuario> usuarios = usuarioRepository.findByStatusAndSuspensoAteLessThanEqual(Status.SUSPENSO, agora);
        for (Usuario usuario : usuarios) {
            usuario.setStatus(Status.ATIVO);
            usuario.setSuspensoAte(null);
        }
        usuarioRepository.saveAll(usuarios);

        List<Anuncio> anuncios = anuncioRepository.findByStatusAndSuspensoAteLessThanEqual(Status.SUSPENSO, agora);
        for (Anuncio anuncio : anuncios) {
            anuncio.setStatus(Status.ATIVO);
            anuncio.setSuspensoAte(null);
        }
        anuncioRepository.saveAll(anuncios);
    }

    // =====================================================================
    // LIMPEZA DE INTERESSES E CONVERSAS
    // =====================================================================

    /** Apaga todos os interesses (e mensagens) de um anúncio e avisa os interessados. */
    private void limparInteressesDoAnuncio(Anuncio anuncio) {
        List<Interesse> interesses = interesseRepository.findByAnuncioCdAnuncio(anuncio.getCdAnuncio());
        apagarInteresses(interesses, Interesse::getUsuario,
                "Um anúncio em que você tinha interesse não está mais disponível.");
    }

    /**
     * Apaga os interesses ligados a um usuário:
     * - os que ele fez em anúncios de outras pessoas (avisa o anunciante);
     * - os que outras pessoas fizeram nos anúncios dele (avisa o interessado).
     */
    private void limparInteressesDoUsuario(Usuario usuario) {
        List<Interesse> feitos = interesseRepository.findByUsuarioCdUsuario(usuario.getCdUsuario());
        apagarInteresses(feitos, i -> i.getAnuncio().getUsuarioCria(),
                "Uma conversa sobre o seu anúncio foi encerrada porque o outro usuário está indisponível.");

        List<Interesse> recebidos = interesseRepository.findByAnuncioUsuarioCriaCdUsuario(usuario.getCdUsuario());
        apagarInteresses(recebidos, Interesse::getUsuario,
                "Um anúncio em que você tinha interesse não está mais disponível.");
    }

    private void apagarInteresses(List<Interesse> interesses, Function<Interesse, Usuario> quemAvisar, String mensagem) {
        for (Interesse interesse : interesses) {
            Long cdAvisar = quemAvisar.apply(interesse).getCdUsuario();
            Long cdInteresse = interesse.getId();

            mensagemRepository.deleteByInteresseId(cdInteresse);
            interesseRepository.delete(interesse);

            messagingTemplate.convertAndSend("/topic/notificacoes/" + cdAvisar,
                    new NotificacaoDTO("INTERESSE_ENCERRADO", mensagem, cdInteresse));
        }
    }

    // =====================================================================
    // AUXILIARES
    // =====================================================================

    private Usuario buscarAdmin(String emailAdmin) {
        Usuario admin = usuarioRepository.findByEmail(emailAdmin)
                .orElseThrow(() -> new ResourceNotFoundException("Administrador não encontrado."));

        if (admin.getPerfil() != Perfil.ADMINISTRADOR) {
            throw new ForbiddenException("Ação permitida somente para administradores.");
        }
        return admin;
    }

    private Usuario buscarUsuario(Long cdUsuario) {
        return usuarioRepository.findById(cdUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    private Anuncio buscarAnuncio(Long cdAnuncio) {
        return anuncioRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio não encontrado."));
    }

    private void validarAlvoUsuario(Usuario usuario) {
        if (usuario.getPerfil() == Perfil.ADMINISTRADOR) {
            throw new BusinessException("Administradores não podem ser suspensos ou excluídos pela moderação.");
        }
        if (usuario.getStatus() == Status.EXCLUIDO) {
            throw new BusinessException("Esta conta já foi excluída.");
        }
    }

    private void validarDias(Integer dias) {
        if (dias == null || dias < DIAS_MINIMO_SUSPENSAO || dias > DIAS_MAXIMO_SUSPENSAO) {
            throw new BusinessException("A suspensão deve ser de "
                    + DIAS_MINIMO_SUSPENSAO + " a " + DIAS_MAXIMO_SUSPENSAO + " dias.");
        }
    }

    /**
     * Se uma denúncia foi informada, confere se ela é sobre o mesmo alvo e,
     * se ainda estiver pendente, marca como PROCEDENTE.
     */
    private Denuncia marcarDenunciaProcedente(Long cdDenuncia, Usuario usuarioAlvo, Anuncio anuncioAlvo,
            Usuario admin) {
        if (cdDenuncia == null) {
            return null;
        }

        Denuncia denuncia = denunciaRepository.findById(cdDenuncia)
                .orElseThrow(() -> new ResourceNotFoundException("Denúncia não encontrada."));

        boolean mesmoUsuario = denuncia.getUsuarioDenunciado().getCdUsuario().equals(usuarioAlvo.getCdUsuario());
        boolean mesmoAnuncio = anuncioAlvo == null
                || (denuncia.getAnuncio() != null
                        && denuncia.getAnuncio().getCdAnuncio().equals(anuncioAlvo.getCdAnuncio()));

        if (!mesmoUsuario || !mesmoAnuncio) {
            throw new BusinessException("A denúncia informada não é sobre este alvo.");
        }

        if (denuncia.getStatus() == StatusDenuncia.PENDENTE) {
            denuncia.setStatus(StatusDenuncia.PROCEDENTE);
            denuncia.setAdminResponsavel(admin);
            denuncia.setDtAnalise(LocalDateTime.now());
            denunciaRepository.save(denuncia);
        }

        return denuncia;
    }

    private Sancao registrarSancao(TipoAlvo tipoAlvo, Usuario usuario, Anuncio anuncio, TipoSancao tipo,
            Integer dias, LocalDateTime dtFim, Usuario admin, Denuncia denuncia) {
        Sancao sancao = new Sancao();
        sancao.setTipoAlvo(tipoAlvo);
        sancao.setUsuario(usuario);
        sancao.setAnuncio(anuncio);
        sancao.setTipo(tipo);
        sancao.setDias(dias);
        sancao.setDtInicio(LocalDateTime.now());
        sancao.setDtFim(dtFim);
        sancao.setAdmin(admin);
        sancao.setDenuncia(denuncia);
        return sancaoRepository.save(sancao);
    }

    private void notificar(Long cdUsuario, String tipo, String mensagem) {
        messagingTemplate.convertAndSend("/topic/notificacoes/" + cdUsuario,
                new NotificacaoDTO(tipo, mensagem, null));
    }
}
