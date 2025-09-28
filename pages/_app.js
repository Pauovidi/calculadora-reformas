import "@/styles/globals.css";
export default function App({ Component, pageProps }){
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="container flex items-center justify-between py-4">
          <div className="font-bold text-xl">🧮 Calculadora Reformas</div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/" className="hover:underline">Formulario</a>
            <a href="/chat" className="hover:underline">Chatbot</a>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Component {...pageProps} />
      </main>
      <footer className="container py-10 text-center text-sm text-gray-500">
        Hecha con Next.js + Tailwind
      </footer>
    </div>
  );
}
