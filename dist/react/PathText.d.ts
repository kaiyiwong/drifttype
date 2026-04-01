export interface PathTextProps {
    children: string;
    path: string;
    font: string;
    spacing?: number;
    startOffset?: number;
    align?: 'start' | 'center' | 'end';
    fill?: string;
    debugPath?: boolean;
    /** Props forwarded to the <svg> element */
    svgProps?: React.SVGAttributes<SVGSVGElement>;
}
export declare function PathText({ children, path, font, spacing, startOffset, align, fill, debugPath, svgProps, }: PathTextProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PathText.d.ts.map