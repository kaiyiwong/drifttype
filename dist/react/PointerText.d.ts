import type { PointerMode } from '../core/types.js';
export interface PointerTextProps {
    children: string;
    font: string;
    mode: PointerMode;
    spacing?: number;
    radius?: number;
    strength?: number;
    fill?: string;
    /** Props forwarded to the <svg> element */
    svgProps?: React.SVGAttributes<SVGSVGElement>;
}
export declare function PointerText({ children, font, mode, spacing, radius, strength, fill, svgProps, }: PointerTextProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PointerText.d.ts.map