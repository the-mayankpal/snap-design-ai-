/** Where the site-wide theme choice is remembered. */
export const THEME_KEY = "snapdesign-theme";

/**
 * Runs before first paint, so a saved choice never flashes the other theme.
 * With no choice saved, `data-theme` stays unset and each area keeps its own
 * default: the marketing and sign-in pages light, the editor and dashboard dark.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;
