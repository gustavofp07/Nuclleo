package br.cefetmg.nuclleo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
public class HomeController {
    
    @GetMapping("")
    public String getHome() {
        return "Bem-vindo ao Nuclleo!";
    }

}
