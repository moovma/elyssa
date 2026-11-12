# Moovma website

The website of **Moovma** and of **Elyssa, the first Tunisian dev board**.

- `/` Moovma (about, services, products, our work, community, contact)
- `/elyssa` Elyssa overview with an interactive 3D board
- `/shop`, `/preorder` reserve a board (saved in Supabase)
- `/docs` schematic, pinout, pin safety, power limits

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
npm run build
```

Everything else (architecture, content rules, design system, scripts, database, deployment):
**read [AGENTS.md](AGENTS.md).**
