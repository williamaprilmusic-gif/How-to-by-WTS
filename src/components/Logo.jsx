export default function Logo({ dark, size = 26 }) {
  const fill = dark ? '#F5F5F5' : '#111827';
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={size} height={Math.round(size * 0.83)} viewBox="0 0 200 166" fill="none">
        <g fill={fill} transform="translate(6,3)">
          <rect x="24" y="20" width="20" height="140" />
          <rect x="16" y="20" width="36" height="8" />
          <rect x="16" y="152" width="36" height="8" />
          <rect x="44" y="80" width="56" height="18" />
          <rect x="100" y="4" width="20" height="156" />
          <rect x="92" y="152" width="36" height="8" />
          <rect x="76" y="4" width="88" height="18" />
          <rect x="76" y="0" width="10" height="26" />
          <rect x="154" y="0" width="10" height="26" />
        </g>
      </svg>
      <div className="leading-none">
        <div className={`text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
          How To
        </div>
        <div className={`text-[10px] font-medium tracking-[0.18em] uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          by WTS
        </div>
      </div>
    </div>
  );
}
