import { useLocation } from "react-router-dom";
import { SUPPORT_WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/contact";

const FloatingWhatsApp = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(SUPPORT_WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="animate-soft-bob animate-soft-pulse fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform duration-300 hover:scale-105 hover:bg-[#1fbc59] sm:bottom-6 sm:right-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M19.11 17.36c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.18-1.33-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.41.12-.54.13-.13.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.11 2.82.14.18 1.92 2.93 4.66 4.11.65.28 1.16.45 1.56.57.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.82-1.28.23-.63.23-1.16.16-1.27-.06-.12-.24-.18-.5-.32Z" />
        <path d="M16.01 3.2c-7.06 0-12.8 5.72-12.8 12.76 0 2.25.59 4.46 1.72 6.41L3.1 28.8l6.59-1.72a12.8 12.8 0 0 0 6.32 1.7h.01c7.06 0 12.8-5.72 12.8-12.76 0-3.41-1.33-6.62-3.75-9.03A12.76 12.76 0 0 0 16.01 3.2Zm0 23.43h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.91 1.02 1.05-3.81-.26-.39a10.55 10.55 0 0 1-1.63-5.7c0-5.87 4.79-10.64 10.68-10.64 2.85 0 5.53 1.11 7.54 3.11a10.56 10.56 0 0 1 3.13 7.53c0 5.87-4.8 10.64-10.69 10.64Z" />
      </svg>
    </a>
  );
};

export default FloatingWhatsApp;
