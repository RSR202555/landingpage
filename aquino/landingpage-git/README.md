# Landing Page Premium - Filipe Aquino

Landing Page moderna e responsiva desenvolvida para consultoria e treinamento personalizado.

## 📁 Estrutura de Arquivos

```
landing-page/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS completos
├── script.js           # Funcionalidades JavaScript
└── assets/             # Pasta para imagens (CRIAR ESTA PASTA)
    ├── foto-dono.jpg   # Foto do dono do projeto
    ├── before1.jpg     # Foto "antes" 1
    ├── after1.jpg      # Foto "depois" 1
    ├── before2.jpg     # Foto "antes" 2
    ├── after2.jpg      # Foto "depois" 2
    ├── before3.jpg     # Foto "antes" 3
    ├── after3.jpg      # Foto "depois" 3
    ├── client1.jpg     # Foto do cliente 1
    ├── client2.jpg     # Foto do cliente 2
    └── client3.jpg     # Foto do cliente 3
```

## 🖼️ Como Trocar as Imagens

### 1. Foto do Dono do Projeto (Hero)
**Arquivo:** `index.html` - Linha 72
```html
<img id="foto-dono" src="/assets/foto-dono.jpg" alt="Filipe Aquino" class="owner-photo">
```
- Substitua `/assets/foto-dono.jpg` pelo caminho da sua foto
- Recomendado: Foto profissional, boa iluminação, fundo neutro
- Tamanho ideal: 800x1000px ou similar (proporção vertical)

### 2. Fotos Antes/Depois
**Arquivo:** `index.html` - Linhas 102-145
```html
<img src="/assets/before1.jpg" alt="Antes 1">
<img src="/assets/after1.jpg" alt="Depois 1">
```
- Substitua os caminhos pelas suas fotos de transformação
- Adicione mais slides duplicando o bloco `.carousel-slide`
- Tamanho ideal: 600x800px (proporção vertical)

### 3. Fotos dos Clientes (Depoimentos)
**Arquivo:** `index.html` - Linhas 163, 189, 215
```html
<img src="/assets/client1.jpg" alt="Cliente 1" class="client-photo">
```
- Substitua pelos caminhos das fotos dos clientes
- Tamanho ideal: 200x200px (quadrado)
- Pode usar fotos de perfil ou avatares

## ⚙️ Personalizações Importantes

### 1. Informações de Contato
**Arquivo:** `index.html` - Rodapé (linha 560)
```html
<a href="mailto:contato@filipeaquino.com">contato@filipeaquino.com</a>
<a href="https://wa.me/5511999999999">(11) 99999-9999</a>
```
- Altere o e-mail e telefone para os seus dados
- O link do WhatsApp deve seguir o formato: `https://wa.me/55DDDNÚMERO`

### 2. Redes Sociais
**Arquivo:** `index.html` - Rodapé (linhas 540-560)
```html
<a href="#" aria-label="Instagram">
<a href="#" aria-label="Facebook">
<a href="#" aria-label="YouTube">
```
- Substitua `#` pelos links das suas redes sociais

### 3. Valores dos Planos
**Arquivo:** `index.html` - Seção Planos (linhas 430-520)
```html
<span class="amount">197</span>
```
- Altere os valores conforme seus preços reais
- Ajuste os benefícios de cada plano

### 4. Depoimentos
**Arquivo:** `index.html` - Seção Depoimentos (linhas 155-230)
- Substitua os nomes, fotos e textos pelos depoimentos reais
- Adicione mais cards duplicando o bloco `.testimonial-card`

### 5. FAQ
**Arquivo:** `index.html` - Seção FAQ (linhas 360-420)
- Personalize as perguntas e respostas conforme suas dúvidas mais frequentes
- Adicione mais itens duplicando o bloco `.faq-item`

## 🎨 Cores do Site

As cores já estão configuradas para combinar com seu site de agendamentos:

```css
--color-bg-primary: #020617;      /* Fundo principal (slate-950) */
--color-bg-secondary: #0f172a;    /* Fundo secundário (slate-900) */
--color-accent-primary: #0ea5e9;  /* Azul principal (sky-500) */
--color-accent-secondary: #22c55e; /* Verde (emerald-500) */
--color-text-primary: #f8fafc;    /* Texto principal (slate-50) */
```

**NÃO ALTERE** essas cores para manter a consistência visual com o site de agendamentos.

## 🚀 Como Usar

### Opção 1: Abrir Localmente
1. Crie a pasta `assets` no mesmo diretório dos arquivos
2. Adicione todas as imagens necessárias
3. Abra o arquivo `index.html` no navegador

### Opção 2: Hospedar Online
1. Faça upload de todos os arquivos para seu servidor
2. Certifique-se de que a pasta `assets` está no mesmo nível do `index.html`
3. Acesse via URL do seu domínio

### Opção 3: Usar com GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Ative o GitHub Pages nas configurações
4. Acesse via `https://seuusuario.github.io/nome-repo`

## 📱 Responsividade

A landing page é 100% responsiva e se adapta automaticamente a:
- 📱 Mobile (smartphones)
- 📱 Tablets
- 💻 Desktop
- 🖥️ Telas grandes

## ✨ Funcionalidades Incluídas

- ✅ Menu mobile com animação
- ✅ Carrossel de antes/depois com swipe
- ✅ FAQ com acordeão animado
- ✅ Scroll suave entre seções
- ✅ Animações ao rolar a página
- ✅ Contador animado de estatísticas
- ✅ Efeito parallax no hero
- ✅ Cards de planos com hover
- ✅ Depoimentos com avaliação em estrelas

## 🔧 Customizações Avançadas

### Adicionar Mais Slides no Carrossel
Duplique este bloco no HTML:
```html
<div class="carousel-slide">
    <div class="before-after-card">
        <div class="before-after-image">
            <img src="/assets/before4.jpg" alt="Antes 4">
            <span class="image-label label-before">ANTES</span>
        </div>
        <div class="before-after-image">
            <img src="/assets/after4.jpg" alt="Depois 4">
            <span class="image-label label-after">DEPOIS</span>
        </div>
    </div>
</div>
```

### Adicionar Mais Depoimentos
Duplique este bloco no HTML:
```html
<div class="testimonial-card">
    <div class="testimonial-header">
        <img src="/assets/client4.jpg" alt="Cliente 4" class="client-photo">
        <div class="client-info">
            <h4 class="client-name">Nome do Cliente</h4>
            <div class="rating">
                <!-- 5 SVGs de estrelas aqui -->
            </div>
        </div>
    </div>
    <p class="testimonial-text">
        Texto do depoimento aqui...
    </p>
</div>
```

### Alterar Estatísticas do Hero
**Arquivo:** `index.html` - Linha 62
```html
<span class="stat-number">500+</span>
<span class="stat-label">Alunos atendidos</span>
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as imagens estão no caminho correto
2. Abra o console do navegador (F12) para ver erros
3. Certifique-se de que os arquivos CSS e JS estão carregando

## 📝 Licença

Código desenvolvido exclusivamente para Filipe Aquino.
Todos os direitos reservados © 2024

---

**Desenvolvido com ❤️ para transformar resultados**
