import logoIcon from '../assets/logo-icon.png';

export default function Logo({ dark, size = 26 }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img src={logoIcon} alt="" width={size} height={size} className="shrink-0" />
      <div className="leading-none">
        <div className={`text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>
          How To
        </div>
        <div className={`text-[10px] font-medium tracking-[0.18em] uppercase ${dark ? 'text-stone-500' : 'text-stone-400'}`}>
          by WTS
        </div>
      </div>
    </div>
  );
}
