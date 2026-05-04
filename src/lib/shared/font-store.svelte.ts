import { loadOverpassBoldFont, loadOverpassExtraBoldFont, loadOverpassRegularFont, type Fonts } from '$lib/generation/general/font-utils';

let fonts = $state<Fonts | null>(null);

export const loadFonts = async (): Promise<void> => {
    if (fonts) {
        return;
    }
    const [regular, bold, extraBold] = await Promise.all([
        loadOverpassRegularFont(),
        loadOverpassBoldFont(),
        loadOverpassExtraBoldFont()
    ]);
    fonts = { regular, bold, extraBold };
};

export const getFonts = (): Fonts | null => fonts;