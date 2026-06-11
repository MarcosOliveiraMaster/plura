# Glassmorphism Design System

> Cores primárias: **Azul · Branco · Preto**

---

## 1. Fundamentos

### Filosofia
Glassmorphism cria interfaces que parecem feitas de vidro fosco: superfícies translúcidas com blur de fundo, bordas sutis e sombras profundas. O efeito requer um fundo com gradiente ou cores para funcionar — o blur revela o que está atrás.

### Anatomia de uma superfície glass
```
┌─────────────────────────────────────────────┐
│  background: rgba(255,255,255, 0.06–0.18)   │ ← transparência
│  backdrop-filter: blur(8–24px) saturate()   │ ← desfoque do fundo
│  border: 1px solid rgba(255,255,255, 0.10–0.30) │ ← borda luminosa
│  box-shadow: inset 0 1px 0 rgba(255,255,255,...)│ ← reflexo superior
│              0 8–32px rgba(0,0,0, 0.25–0.50) │ ← sombra profunda
└─────────────────────────────────────────────┘
```

---

## 2. Cores

### 2.1 Blue Scale (primária)
| Token        | Hex       | Uso                                  |
|--------------|-----------|--------------------------------------|
| `blue-50`    | `#e8f4ff` | Fundos sutis, hovers claros          |
| `blue-100`   | `#c3ddff` | Ícones em modo claro                 |
| `blue-200`   | `#9ac6ff` | Bordas ativas em modo claro          |
| `blue-300`   | `#6aadff` | Ícones, indicadores ativos           |
| `blue-400`   | `#3d94ff` | Hover de botão primário              |
| **`blue-500`** | **`#1a7aff`** | **Brand primary — botões, links** |
| `blue-600`   | `#0062e6` | Pressed state, gradiente end         |
| `blue-700`   | `#004bbf` | Texto em fundo claro                 |
| `blue-800`   | `#003499` | Deep accent                          |
| `blue-900`   | `#001e6e` | Background tonal escuro              |

### 2.2 White Alpha
| Token           | Valor                      | Uso                                  |
|-----------------|----------------------------|--------------------------------------|
| `white/10`      | `rgba(255,255,255,0.10)`   | Glass bg sutil (tier 1)              |
| `white/20`      | `rgba(255,255,255,0.20)`   | Glass bg médio (tier 2)              |
| `white/40`      | `rgba(255,255,255,0.40)`   | Textos desabilitados/helper          |
| `white/60`      | `rgba(255,255,255,0.60)`   | Textos secundários                   |
| `white/80`      | `rgba(255,255,255,0.80)`   | Textos de label                      |
| `white`         | `#ffffff`                  | Texto principal, ícones destacados   |

### 2.3 Black Alpha
| Token           | Valor                      | Uso                            |
|-----------------|----------------------------|--------------------------------|
| `black/10`      | `rgba(0,0,0,0.10)`         | Hover overlay                  |
| `black/20`      | `rgba(0,0,0,0.20)`         | Sombra leve                    |
| `black/40`      | `rgba(0,0,0,0.40)`         | Overlay de modal               |
| `black/60`      | `rgba(0,0,0,0.60)`         | Overlay escuro                 |
| `black/80`      | `rgba(0,0,0,0.80)`         | Backdrop de modal profundo     |

### 2.4 Semantic
| Token        | Hex       | Uso              |
|--------------|-----------|------------------|
| `success`    | `#22c55e` | Confirmação, OK  |
| `warning`    | `#f59e0b` | Alerta           |
| `error`      | `#ef4444` | Erro, destrutivo |
| `info`       | `#1a7aff` | Informação       |

### 2.5 Gradientes
```css
/* Background principal da app */
--gradient-hero: linear-gradient(135deg, #050510 0%, #0a1628 50%, #060d1f 100%);

/* Glass com tinte azul */
--gradient-glass-blue: linear-gradient(135deg, rgba(26,122,255,0.25), rgba(0,98,230,0.15));

/* Botão primário */
--gradient-btn-primary: linear-gradient(135deg, #1a7aff 0%, #0062e6 100%);

/* Shimmer / loading skeleton */
--gradient-shimmer: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
```

---

## 3. Tipografia

### Famílias
| Uso           | Família                           | Fallback               |
|---------------|-----------------------------------|------------------------|
| **Interface** | Inter                             | Segoe UI, system-ui    |
| **Código**    | JetBrains Mono                    | Fira Code, monospace   |

### Escala de tamanhos
| Token   | rem       | px  | Uso                                  |
|---------|-----------|-----|--------------------------------------|
| `xs`    | 0.75rem   | 12  | Labels, captions, badges small       |
| `sm`    | 0.875rem  | 14  | Texto de suporte, helper text        |
| `base`  | 1rem      | 16  | Corpo de texto padrão                |
| `lg`    | 1.125rem  | 18  | Subtítulos, botão large              |
| `xl`    | 1.25rem   | 20  | Títulos de card                      |
| `2xl`   | 1.5rem    | 24  | Títulos de seção                     |
| `3xl`   | 1.875rem  | 30  | Heading secundário                   |
| `4xl`   | 2.25rem   | 36  | Heading principal                    |
| `5xl`   | 3rem      | 48  | Display                              |
| `6xl`   | 3.75rem   | 60  | Hero                                 |

### Pesos
| Token      | Valor | Uso                             |
|------------|-------|---------------------------------|
| light      | 300   | Texto decorativo                |
| regular    | 400   | Corpo, descrições               |
| medium     | 500   | Labels, navegação               |
| semibold   | 600   | Botões, títulos de card, badges |
| bold       | 700   | Headings                        |
| extrabold  | 800   | Hero, display                   |

---

## 4. Espaçamento

Sistema baseado em múltiplos de 4px:

| Token    | rem      | px  |
|----------|----------|-----|
| space-1  | 0.25rem  | 4   |
| space-2  | 0.5rem   | 8   |
| space-3  | 0.75rem  | 12  |
| space-4  | 1rem     | 16  |
| space-5  | 1.25rem  | 20  |
| space-6  | 1.5rem   | 24  |
| space-8  | 2rem     | 32  |
| space-10 | 2.5rem   | 40  |
| space-12 | 3rem     | 48  |
| space-16 | 4rem     | 64  |
| space-20 | 5rem     | 80  |
| space-24 | 6rem     | 96  |

---

## 5. Border Radius

| Token       | rem      | px  | Uso                           |
|-------------|----------|-----|-------------------------------|
| radius-sm   | 0.375rem | 6   | Badges, inputs small          |
| radius-md   | 0.75rem  | 12  | Inputs, botões small          |
| radius-lg   | 1rem     | 16  | Botões, cards compactos       |
| radius-xl   | 1.5rem   | 24  | Cards padrão                  |
| radius-2xl  | 2rem     | 32  | Cards grandes, modais         |
| radius-full | 9999px   | —   | Badges pill, avatares, toggles|

---

## 6. Superfícies Glass

### Níveis de blur
| Nível | Backdrop Filter               | BG Alpha | Border Alpha | Uso                    |
|-------|-------------------------------|----------|--------------|------------------------|
| SM    | `blur(8px) saturate(1.4)`     | 6%       | 10%          | Itens de lista, chips  |
| MD    | `blur(16px) saturate(1.6)`    | 12%      | 18%          | Cards gerais           |
| LG    | `blur(24px) saturate(1.8)`    | 18%      | 30%          | Modais, sidebars       |
| XL    | `blur(40px) saturate(2.0)`    | 22%      | 35%          | Overlays críticos      |

### Sombras
| Token        | Valor                                                              |
|--------------|--------------------------------------------------------------------|
| shadow-sm    | `0 2px 8px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.10)` |
| shadow-md    | `0 8px 24px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.12)`|
| shadow-lg    | `0 16px 48px rgba(0,0,0,.40), inset 0 1px 0 rgba(255,255,255,.15)`|
| shadow-xl    | `0 32px 80px rgba(0,0,0,.50), inset 0 1px 0 rgba(255,255,255,.18)`|
| shadow-glow  | `0 0 30px rgba(26,122,255,.35), 0 8px 24px rgba(0,0,0,.30)`       |

---

## 7. Componentes

### 7.1 Button
Variantes: `primary` · `secondary` · `ghost` · `danger` · `success`
Tamanhos: `sm` · `md` · `lg`
Estados: default · hover (translateY -2px) · pressed (scale 0.98) · loading · disabled (opacity 0.5)

```
primary:   gradient azul + glow azul
secondary: glass transparente
ghost:     sem background
danger:    gradient vermelho
success:   gradient verde
```

### 7.2 Input / Form
- Fundo: `rgba(255,255,255,0.07)` com blur de 12px
- Borda padrão: `rgba(255,255,255,0.15)`
- Borda focused: `rgba(26,122,255,0.70)` + ring `rgba(26,122,255,0.20)`
- Borda erro: `rgba(239,68,68,0.60)` + ring vermelho
- Caret azul: `#3d94ff`
- Placeholder: `rgba(255,255,255,0.25)`
- Componentes: `Input` · `Textarea` · `Select` · `Checkbox` · `Toggle`

### 7.3 Card
Variantes de card glass: `sm` · `default` · `lg` · `blue`
Hover: `translateY(-4px) scale(1.01)` + sombra intensificada

### 7.4 Badge
Variantes: `blue` · `white` · `success` · `warning` · `error` · `outline`
Tamanhos: `sm` · `md`
Com indicador `dot` animado (glow de cor correspondente)

### 7.5 Avatar
Tamanhos: `sm (32)` · `md (40)` · `lg (52)` · `xl (64)`
Status: `online` (verde) · `away` (amarelo) · `busy` (vermelho) · `offline` (branco/10)
Suporte a `AvatarGroup` com sobreposição e contador de excedentes

### 7.6 Notification / Toast
Variantes: `info` · `success` · `warning` · `error`
Animação: `slideInRight 300ms spring`
Dispensável via botão close

---

## 8. Animações

| Token        | Duração | Easing                          | Uso                       |
|--------------|---------|---------------------------------|---------------------------|
| fast         | 150ms   | cubic-bezier(0.4, 0, 0.2, 1)   | Hover, focus              |
| normal       | 250ms   | cubic-bezier(0.4, 0, 0.2, 1)   | Transições gerais         |
| slow         | 400ms   | cubic-bezier(0.4, 0, 0.2, 1)   | Modais, drawers           |
| spring       | 400ms   | cubic-bezier(0.34, 1.56, 0.64, 1)| Bounce effects, toggles |

---

## 9. Acessibilidade

- **Contraste**: textos principais em `white` sobre backgrounds escuros atingem AA (≥4.5:1)
- **Focus visible**: ring de `rgba(26,122,255,0.45)` em todos os elementos interativos
- **Reduced motion**: usar `@media (prefers-reduced-motion: reduce)` para desativar `transform` e `backdrop-filter` pesado
- **Fontes**: mínimo `14px` para texto interativo, `12px` para labels/captions apenas

---

## 10. Tokens CSS (variáveis)

Todos os tokens estão disponíveis como CSS custom properties em `:root` no arquivo `src/design-system/global.css` e como constantes TypeScript em `src/design-system/tokens.ts`.

```css
/* Exemplo de uso */
.meu-card {
  background:       var(--glass-bg-md);
  backdrop-filter:  var(--glass-blur-md);
  border:           var(--glass-border-default);
  box-shadow:       var(--glass-shadow-md);
  border-radius:    var(--radius-xl);
  color:            var(--color-white);
  font-family:      var(--font-sans);
}
```

---

## 11. Como rodar

```bash
cd desing/glass-design-system
npm install
npm run dev     # http://localhost:5173
npm run build   # build de produção
```
