package br.cefetmg.nuclleo.services;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.TotalInteressadosDTO;
import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.AnuncioComunidade;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@Service
public class AnuncioComunidadeService {
    @Autowired
    private AnuncioComunidadeRepository repository;

    @Autowired
    private AnuncioRepository anuncioRepository;

    @Autowired
    private InteresseRepository interesseRepository;

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public AnuncioComunidade inserir(AnuncioComunidade anuncioComunidade, String emailSolicitante) {
        return inserirRelacoes(List.of(anuncioComunidade), emailSolicitante).get(0);
    }

    /** RN03: só o dono publica o anúncio, e só nas comunidades de que ele participa. */
    @Transactional
    public List<AnuncioComunidade> inserirRelacoes(List<AnuncioComunidade> relacoes, String emailSolicitante) {
        Usuario solicitante = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        return repository.saveAll(relacoes.stream().map(relacao -> montarRelacao(relacao, solicitante)).toList());
    }

    // Do corpo só valem os códigos: anúncio e comunidade são sempre os que estão no banco
    private AnuncioComunidade montarRelacao(AnuncioComunidade pedido, Usuario solicitante) {
        if (pedido.getAnuncio() == null || pedido.getAnuncio().getCdAnuncio() == null
                || pedido.getComunidade() == null || pedido.getComunidade().getCdComunidade() == null) {
            throw new BadRequestException("O anúncio e a comunidade são obrigatórios.");
        }

        Anuncio anuncio = buscarAnuncio(pedido.getAnuncio().getCdAnuncio());
        Comunidade comunidade = buscarComunidade(pedido.getComunidade().getCdComunidade());

        if (!AnuncioService.ehDono(anuncio, solicitante.getEmail())) {
            throw new ForbiddenException("Você só pode publicar os seus próprios anúncios.");
        }

        boolean participa = ehDonoDaComunidade(comunidade, solicitante.getEmail())
                || usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(
                        solicitante.getCdUsuario(), comunidade.getCdComunidade());
        if (!participa) {
            throw new ForbiddenException("Você só pode publicar anúncios nas comunidades de que participa.");
        }

        AnuncioComunidade relacao = new AnuncioComunidade();
        relacao.setAnuncio(anuncio);
        relacao.setComunidade(comunidade);
        return relacao;
    }

    private Anuncio buscarAnuncio(Long cdAnuncio) {
        return anuncioRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio não encontrado."));
    }

    private Comunidade buscarComunidade(Long cdComunidade) {
        return comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada."));
    }

    private static boolean ehDonoDaComunidade(Comunidade comunidade, String email) {
        return email != null
                && comunidade.getUsuarioCria() != null
                && email.equalsIgnoreCase(comunidade.getUsuarioCria().getEmail());
    }

    @Transactional(readOnly = true)
    public Page<Anuncio> listarAnunciosDaComunidade(Long cdComunidade, String busca, Anuncio.TipoAnuncio tipo,
            Pageable pagina) {
        List<Anuncio.TipoAnuncio> tipos = tipo != null ? List.of(tipo) : List.of(Anuncio.TipoAnuncio.values());

        Page<Anuncio> anuncios = repository.findAnunciosByComunidade(cdComunidade, tipos, padraoBusca(busca), pagina);
        preencherTotalInteressados(anuncios.getContent());
        return anuncios;
    }

    /** Os anúncios com mais pessoas interessadas na comunidade, do mais procurado para o menos. */
    @Transactional(readOnly = true)
    public List<Anuncio> listarPopularesDaComunidade(Long cdComunidade, int limite) {
        List<TotalInteressadosDTO> ranking = interesseRepository.rankingDaComunidade(cdComunidade,
                PageRequest.of(0, limite));

        Map<Long, Anuncio> anuncios = anuncioRepository
                .findAllById(ranking.stream().map(TotalInteressadosDTO::cdAnuncio).toList()).stream()
                .collect(Collectors.toMap(Anuncio::getCdAnuncio, Function.identity()));

        return ranking.stream().map(item -> {
            Anuncio anuncio = anuncios.get(item.cdAnuncio());
            anuncio.setTotalInteressados(item.total());
            return anuncio;
        }).toList();
    }

    private void preencherTotalInteressados(List<Anuncio> anuncios) {
        if (anuncios.isEmpty()) {
            return;
        }

        Map<Long, Long> totais = interesseRepository
                .contarInteressados(anuncios.stream().map(Anuncio::getCdAnuncio).toList()).stream()
                .collect(Collectors.toMap(TotalInteressadosDTO::cdAnuncio, TotalInteressadosDTO::total));

        anuncios.forEach(a -> a.setTotalInteressados(totais.getOrDefault(a.getCdAnuncio(), 0L)));
    }

    // % e _ digitados pelo usuário são texto comum, não curingas do LIKE
    private String padraoBusca(String busca) {
        if (busca == null) {
            return "%%";
        }

        String termo = busca.trim().toLowerCase()
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
        return "%" + termo + "%";
    }

    @Transactional(readOnly = true)
    public List<AnuncioComunidade> listarAnuncioComunidade() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<AnuncioComunidade> listarPorAnuncio(Long cdAnuncio) {
        return repository.findByAnuncioCdAnuncio(cdAnuncio);
    }

    @Transactional(readOnly = true)
    public List<AnuncioComunidade> listarPorComunidade(Long cdComunidade) {
        return repository.findByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> excluirPorComunidade(Long cdComunidade, String emailSolicitante) {
        if (!ehDonoDaComunidade(buscarComunidade(cdComunidade), emailSolicitante)) {
            throw new ForbiddenException("Apenas o administrador da comunidade pode remover os anúncios dela.");
        }
        return repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> excluirPorAnuncio(Long cdAnuncio, String emailSolicitante) {
        if (!AnuncioService.ehDono(buscarAnuncio(cdAnuncio), emailSolicitante)) {
            throw new ForbiddenException("Você só pode alterar os seus próprios anúncios.");
        }
        return repository.deleteByAnuncioCdAnuncio(cdAnuncio);
    }

    // Tirar um anúncio de uma comunidade: o dono do anúncio ou o dono da comunidade
    @Transactional
    public AnuncioComunidade excluirRelacaoEspecifica(Long cdAnuncio, Long cdComunidade, String emailSolicitante) {
        if (!AnuncioService.ehDono(buscarAnuncio(cdAnuncio), emailSolicitante)
                && !ehDonoDaComunidade(buscarComunidade(cdComunidade), emailSolicitante)) {
            throw new ForbiddenException("Você não pode remover este anúncio da comunidade.");
        }
        return repository.deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(cdAnuncio, cdComunidade);
    }
}
