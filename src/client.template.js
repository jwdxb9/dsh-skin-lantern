window.__ModuleLoader__.load({
  id: 'dsh-skin-lantern',
  factory() {
    // Assembled by build.mjs from src/skin.css plus your wallpaper image.
    const SKIN_CSS = "__SKIN_CSS__";

    // The wallpaper and the pane tokens belong to the whole document, so the
    // sheet is a plugin-owned global style rather than a component tree. The
    // module system tracks `data-plugin` styles and removes them with the
    // entry, which is the same convention the shipped UI packages use.
    const tagId = 'dsh-skin-lantern/skin.css';
    if (
      typeof document !== 'undefined'
      && document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) === null
    ) {
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-skin-lantern';
      tag.dataset.pluginCss = tagId;
      tag.textContent = SKIN_CSS;
      document.head.append(tag);
    }

    return {
      apply() {},
    };
  },
});
