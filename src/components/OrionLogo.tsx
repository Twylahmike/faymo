// Icon mark for the ORION brand: a particle ring with a swoosh crossing
// through it, echoing the brand's logo artwork. Renders as an inline SVG so
// it scales cleanly at any size and inherits color via `className`/`color`.
const OrionLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="orion-swoosh" x1="8" y1="70" x2="92" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1e6fd9" stopOpacity="0.2" />
        <stop offset="45%" stopColor="#5fd4ff" stopOpacity="1" />
        <stop offset="100%" stopColor="#1e6fd9" stopOpacity="0.2" />
      </linearGradient>
    </defs>

    {/* Particle ring */}
    <g className="text-primary" opacity="0.9">
      <circle cx="26.34" cy="21.61" r="0.52" fill="currentColor" opacity="0.73"/>
      <circle cx="35.05" cy="19.88" r="1.02" fill="currentColor" opacity="0.31"/>
      <circle cx="17.85" cy="67.17" r="0.73" fill="currentColor" opacity="0.27"/>
      <circle cx="60.63" cy="81.93" r="0.84" fill="currentColor" opacity="0.6"/>
      <circle cx="54.67" cy="74.86" r="0.35" fill="currentColor" opacity="0.77"/>
      <circle cx="40.99" cy="23.32" r="0.61" fill="currentColor" opacity="0.35"/>
      <circle cx="80.71" cy="41.54" r="0.42" fill="currentColor" opacity="0.8"/>
      <circle cx="22.26" cy="28.84" r="0.96" fill="currentColor" opacity="0.72"/>
      <circle cx="13.17" cy="41.47" r="0.76" fill="currentColor" opacity="0.79"/>
      <circle cx="26.34" cy="28.19" r="1.0" fill="currentColor" opacity="0.63"/>
      <circle cx="39.74" cy="15.03" r="0.57" fill="currentColor" opacity="0.3"/>
      <circle cx="53.67" cy="83.82" r="0.43" fill="currentColor" opacity="0.43"/>
      <circle cx="30.37" cy="27.54" r="0.51" fill="currentColor" opacity="0.42"/>
      <circle cx="83.75" cy="35.81" r="0.84" fill="currentColor" opacity="0.65"/>
      <circle cx="65.5" cy="78.69" r="0.63" fill="currentColor" opacity="0.89"/>
      <circle cx="30.85" cy="26.85" r="0.77" fill="currentColor" opacity="0.69"/>
      <circle cx="68.5" cy="21.97" r="0.37" fill="currentColor" opacity="0.46"/>
      <circle cx="46.72" cy="79.26" r="0.51" fill="currentColor" opacity="0.86"/>
      <circle cx="71.48" cy="28.89" r="0.65" fill="currentColor" opacity="0.84"/>
      <circle cx="11.62" cy="60.15" r="0.55" fill="currentColor" opacity="0.41"/>
      <circle cx="19.91" cy="37.79" r="1.02" fill="currentColor" opacity="0.51"/>
      <circle cx="57.59" cy="88.87" r="1.1" fill="currentColor" opacity="0.58"/>
      <circle cx="79.7" cy="69.09" r="0.82" fill="currentColor" opacity="0.76"/>
      <circle cx="20.25" cy="65.83" r="0.4" fill="currentColor" opacity="0.5"/>
      <circle cx="69.99" cy="49.51" r="1.0" fill="currentColor" opacity="0.26"/>
      <circle cx="44.41" cy="19.94" r="0.86" fill="currentColor" opacity="0.6"/>
      <circle cx="46.68" cy="81.29" r="0.68" fill="currentColor" opacity="0.54"/>
      <circle cx="79.82" cy="41.1" r="1.01" fill="currentColor" opacity="0.42"/>
      <circle cx="12.22" cy="49.86" r="1.0" fill="currentColor" opacity="0.44"/>
      <circle cx="23.02" cy="17.82" r="0.81" fill="currentColor" opacity="0.35"/>
      <circle cx="51.93" cy="25.49" r="0.75" fill="currentColor" opacity="0.25"/>
      <circle cx="36.13" cy="77.58" r="0.36" fill="currentColor" opacity="0.85"/>
      <circle cx="75.4" cy="25.76" r="0.39" fill="currentColor" opacity="0.82"/>
      <circle cx="77.65" cy="40.42" r="0.41" fill="currentColor" opacity="0.57"/>
      <circle cx="80.44" cy="64.14" r="0.45" fill="currentColor" opacity="0.56"/>
      <circle cx="26.69" cy="42.46" r="0.55" fill="currentColor" opacity="0.82"/>
      <circle cx="19.46" cy="66.01" r="0.9" fill="currentColor" opacity="0.38"/>
      <circle cx="35.24" cy="86.15" r="1.1" fill="currentColor" opacity="0.67"/>
      <circle cx="21.8" cy="61.56" r="0.52" fill="currentColor" opacity="0.47"/>
      <circle cx="22.19" cy="32.76" r="0.52" fill="currentColor" opacity="0.39"/>
      <circle cx="77.56" cy="63.18" r="1.03" fill="currentColor" opacity="0.81"/>
      <circle cx="77.4" cy="63.07" r="0.53" fill="currentColor" opacity="0.68"/>
      <circle cx="59.11" cy="89.86" r="0.78" fill="currentColor" opacity="0.56"/>
      <circle cx="58.99" cy="9.33" r="0.96" fill="currentColor" opacity="0.37"/>
      <circle cx="73.16" cy="66.15" r="0.7" fill="currentColor" opacity="0.72"/>
      <circle cx="33.7" cy="18.8" r="1.09" fill="currentColor" opacity="0.31"/>
      <circle cx="27.32" cy="65.91" r="0.54" fill="currentColor" opacity="0.37"/>
      <circle cx="10.72" cy="63.14" r="0.67" fill="currentColor" opacity="0.43"/>
      <circle cx="50.05" cy="87.79" r="1.0" fill="currentColor" opacity="0.61"/>
      <circle cx="78.96" cy="59.53" r="1.1" fill="currentColor" opacity="0.79"/>
      <circle cx="90.91" cy="41.93" r="0.47" fill="currentColor" opacity="0.57"/>
      <circle cx="56.47" cy="77.92" r="0.65" fill="currentColor" opacity="0.29"/>
      <circle cx="23.26" cy="75.44" r="0.94" fill="currentColor" opacity="0.55"/>
      <circle cx="21.11" cy="65.18" r="1.07" fill="currentColor" opacity="0.9"/>
      <circle cx="19.54" cy="38.87" r="0.57" fill="currentColor" opacity="0.88"/>
      <circle cx="23.5" cy="35.61" r="0.76" fill="currentColor" opacity="0.74"/>
      <circle cx="76.12" cy="59.81" r="0.99" fill="currentColor" opacity="0.35"/>
      <circle cx="79.11" cy="42.68" r="0.41" fill="currentColor" opacity="0.37"/>
      <circle cx="24.08" cy="32.38" r="0.44" fill="currentColor" opacity="0.83"/>
      <circle cx="50.71" cy="79.73" r="0.8" fill="currentColor" opacity="0.65"/>
      <circle cx="25.76" cy="63.48" r="1.05" fill="currentColor" opacity="0.38"/>
      <circle cx="43.69" cy="20.73" r="0.53" fill="currentColor" opacity="0.51"/>
      <circle cx="35.05" cy="22.1" r="0.91" fill="currentColor" opacity="0.3"/>
      <circle cx="14.12" cy="59.62" r="1.1" fill="currentColor" opacity="0.9"/>
      <circle cx="80.37" cy="65.06" r="1.05" fill="currentColor" opacity="0.82"/>
      <circle cx="76.73" cy="24.67" r="0.63" fill="currentColor" opacity="0.35"/>
      <circle cx="65.58" cy="23.18" r="1.09" fill="currentColor" opacity="0.68"/>
      <circle cx="76.38" cy="51.3" r="0.96" fill="currentColor" opacity="0.44"/>
      <circle cx="31.63" cy="19.64" r="0.44" fill="currentColor" opacity="0.32"/>
      <circle cx="19.78" cy="39.5" r="0.55" fill="currentColor" opacity="0.64"/>
      <circle cx="42.92" cy="15.68" r="0.55" fill="currentColor" opacity="0.57"/>
      <circle cx="82.96" cy="27.7" r="0.98" fill="currentColor" opacity="0.31"/>
      <circle cx="20.79" cy="65.21" r="0.93" fill="currentColor" opacity="0.66"/>
      <circle cx="47.49" cy="83.32" r="0.91" fill="currentColor" opacity="0.61"/>
      <circle cx="18.57" cy="65.35" r="1.01" fill="currentColor" opacity="0.84"/>
      <circle cx="18.23" cy="40.64" r="0.98" fill="currentColor" opacity="0.63"/>
      <circle cx="71.5" cy="78.86" r="1.02" fill="currentColor" opacity="0.77"/>
      <circle cx="73.12" cy="22.3" r="1.02" fill="currentColor" opacity="0.39"/>
      <circle cx="50.12" cy="89.95" r="1.01" fill="currentColor" opacity="0.51"/>
      <circle cx="22.23" cy="23.71" r="0.47" fill="currentColor" opacity="0.85"/>
      <circle cx="77.7" cy="18.43" r="1.01" fill="currentColor" opacity="0.27"/>
      <circle cx="47.33" cy="18.47" r="0.6" fill="currentColor" opacity="0.86"/>
      <circle cx="62.57" cy="13.09" r="0.55" fill="currentColor" opacity="0.76"/>
      <circle cx="70.32" cy="66.41" r="1.0" fill="currentColor" opacity="0.81"/>
      <circle cx="56.08" cy="84.73" r="0.58" fill="currentColor" opacity="0.77"/>
      <circle cx="53.92" cy="77.65" r="0.37" fill="currentColor" opacity="0.38"/>
      <circle cx="30.36" cy="86.66" r="0.56" fill="currentColor" opacity="0.67"/>
      <circle cx="31.28" cy="63.66" r="1.09" fill="currentColor" opacity="0.6"/>
      <circle cx="88.98" cy="34.35" r="0.48" fill="currentColor" opacity="0.88"/>
      <circle cx="45.94" cy="91.6" r="0.43" fill="currentColor" opacity="0.53"/>
      <circle cx="45.92" cy="19.93" r="0.73" fill="currentColor" opacity="0.5"/>
      <circle cx="15.17" cy="31.82" r="0.54" fill="currentColor" opacity="0.71"/>
      <circle cx="88.55" cy="50.41" r="0.89" fill="currentColor" opacity="0.73"/>
      <circle cx="35.56" cy="23.48" r="0.62" fill="currentColor" opacity="0.3"/>
      <circle cx="34.14" cy="23.48" r="0.99" fill="currentColor" opacity="0.72"/>
      <circle cx="38.56" cy="84.98" r="0.58" fill="currentColor" opacity="0.52"/>
      <circle cx="23.62" cy="68.57" r="0.67" fill="currentColor" opacity="0.86"/>
      <circle cx="34.34" cy="18.14" r="1.03" fill="currentColor" opacity="0.65"/>
      <circle cx="39.66" cy="81.19" r="0.57" fill="currentColor" opacity="0.53"/>
      <circle cx="21.12" cy="34.13" r="0.84" fill="currentColor" opacity="0.55"/>
      <circle cx="17.96" cy="62.19" r="1.03" fill="currentColor" opacity="0.77"/>
      <circle cx="68.62" cy="83.71" r="0.41" fill="currentColor" opacity="0.59"/>
      <circle cx="31.02" cy="29.02" r="0.91" fill="currentColor" opacity="0.69"/>
      <circle cx="56.5" cy="90.43" r="0.5" fill="currentColor" opacity="0.27"/>
      <circle cx="50.76" cy="73.37" r="0.4" fill="currentColor" opacity="0.52"/>
      <circle cx="26.34" cy="24.87" r="0.5" fill="currentColor" opacity="0.7"/>
      <circle cx="16.74" cy="51.18" r="0.35" fill="currentColor" opacity="0.74"/>
      <circle cx="55.06" cy="10.02" r="0.43" fill="currentColor" opacity="0.53"/>
      <circle cx="67.44" cy="84.7" r="0.39" fill="currentColor" opacity="0.41"/>
      <circle cx="68.2" cy="24.39" r="0.69" fill="currentColor" opacity="0.77"/>
      <circle cx="30.34" cy="15.5" r="1.06" fill="currentColor" opacity="0.83"/>
      <circle cx="25.32" cy="28.88" r="0.89" fill="currentColor" opacity="0.58"/>
      <circle cx="61.06" cy="30.05" r="0.91" fill="currentColor" opacity="0.56"/>
      <circle cx="48.28" cy="79.79" r="0.54" fill="currentColor" opacity="0.66"/>
      <circle cx="52.58" cy="24.09" r="0.56" fill="currentColor" opacity="0.3"/>
      <circle cx="42.86" cy="81.26" r="0.55" fill="currentColor" opacity="0.46"/>
      <circle cx="15.78" cy="41.18" r="0.87" fill="currentColor" opacity="0.71"/>
      <circle cx="82.9" cy="64.05" r="0.66" fill="currentColor" opacity="0.6"/>
      <circle cx="20.31" cy="67.37" r="1.03" fill="currentColor" opacity="0.63"/>
      <circle cx="37.24" cy="14.18" r="0.99" fill="currentColor" opacity="0.75"/>
      <circle cx="22.49" cy="75.71" r="0.92" fill="currentColor" opacity="0.8"/>
      <circle cx="81.76" cy="40.43" r="0.66" fill="currentColor" opacity="0.74"/>
      <circle cx="21.07" cy="41.37" r="0.51" fill="currentColor" opacity="0.53"/>
      <circle cx="80.36" cy="55.6" r="0.6" fill="currentColor" opacity="0.69"/>
      <circle cx="20.43" cy="70.28" r="0.45" fill="currentColor" opacity="0.65"/>
      <circle cx="87.29" cy="56.38" r="0.65" fill="currentColor" opacity="0.62"/>
      <circle cx="80.86" cy="55.31" r="0.7" fill="currentColor" opacity="0.28"/>
      <circle cx="27.6" cy="71.27" r="0.51" fill="currentColor" opacity="0.46"/>
      <circle cx="51.9" cy="23.12" r="0.97" fill="currentColor" opacity="0.41"/>
      <circle cx="83.73" cy="69.07" r="0.36" fill="currentColor" opacity="0.6"/>
      <circle cx="78.74" cy="49.98" r="0.94" fill="currentColor" opacity="0.67"/>
      <circle cx="51.03" cy="11.15" r="1.06" fill="currentColor" opacity="0.38"/>
      <circle cx="84.21" cy="54.41" r="0.85" fill="currentColor" opacity="0.62"/>
      <circle cx="57.02" cy="84.41" r="0.87" fill="currentColor" opacity="0.75"/>
      <circle cx="63.09" cy="73.05" r="0.44" fill="currentColor" opacity="0.78"/>
      <circle cx="77.14" cy="43.88" r="0.43" fill="currentColor" opacity="0.27"/>
      <circle cx="39.58" cy="75.39" r="0.65" fill="currentColor" opacity="0.71"/>
      <circle cx="69.27" cy="59.97" r="0.87" fill="currentColor" opacity="0.66"/>
      <circle cx="77.56" cy="70.53" r="0.8" fill="currentColor" opacity="0.33"/>
      <circle cx="73.23" cy="47.63" r="0.94" fill="currentColor" opacity="0.48"/>
    </g>

    {/* Swoosh crossing through the ring */}
    <path
      d="M8 68 C 28 48, 40 30, 50 50 S 80 44, 92 32"
      stroke="url(#orion-swoosh)"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

export default OrionLogo;
