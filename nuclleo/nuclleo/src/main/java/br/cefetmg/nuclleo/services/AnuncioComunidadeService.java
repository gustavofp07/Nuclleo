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
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.AnuncioComunidade;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;

@Service
public class AnuncioComunidadeService {
    @Autowired
    private AnuncioComunidadeRepository repository;

    @Autowired
    private AnuncioRepository anuncioRepository;

    @Autowired
    private InteresseRepository interesseRepository;

    @Transactional
    public AnuncioComunidade inserir(AnuncioComunidade anuncioComunidade) {
        return repository.save(anuncioComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> inserirRelacoes(List<AnuncioComunidade> relacoes) {
        return repository.saveAll(relacoes);
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
    public List<AnuncioComunidade> excluirPorComunidade(Long cdComunidade) {
        return repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> excluirPorAnuncio(Long cdAnuncio) {
        return repository.deleteByAnuncioCdAnuncio(cdAnuncio);
    }

    @Transactional
    public AnuncioComunidade excluirRelacaoEspecifica(Long cdAnuncio, Long cdComunidade) {
        return repository.deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(cdAnuncio, cdComunidade);
    }
}
