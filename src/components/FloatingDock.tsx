import { Shield, MessageSquare, Briefcase, Download } from "lucide-react";
import { toast } from "sonner";

export function FloatingDock() {
  const handleVCardClick = () => {
    toast.success("Contatto salvato. MR Studio è ora nella tua rubrica.", {
      style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      // Rimosso iconTheme per risolvere l'errore TS2353 di Vercel
    });
    
    const link = document.createElement("a");
    link.href = "/contact.vcf";
    link.download = "Riccardo_Modena_MRStudio.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const menuItems =[
    { title: 'Omnia', icon: <Shield size={18} />, color: '#a955ff', url: 'https://omniastudio-pro.vercel.app/' },
    { title: 'Concierge', icon: <MessageSquare size={18} />, color: '#56CCF2', url: 'https://concierge24.vercel.app/' },
    { title: 'HomeTour', icon: <Briefcase size={18} />, color: '#80FF72', url: 'https://hometour-studio.vercel.app/' },
    { title: 'vCard', icon: <Download size={18} />, color: '#FF9966', action: handleVCardClick },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <ul className="flex gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">
        {menuItems.map((item, idx) => (
          <li
            key={idx}
            onClick={() => {
              if (item.url) window.open(item.url, '_blank');
              if (item.action) item.action();
            }}
            className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer group hover:w-32 transition-all duration-300 overflow-hidden border border-white/5"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: item.color }}></span>
            <span className="relative z-10 transition-all duration-300 group-hover:translate-x-[-35px] group-hover:text-white" style={{ color: item.color }}>
              {item.icon}
            </span>
            <span className="absolute left-12 text-white text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
              {item.title}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
