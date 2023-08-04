import * as util from "../util.js";
import { ThemeSettings } from "./theme-settings.js";
import { UXSettings } from "./ux-settings.js";
import { AvatarSettings } from "./avatar-settings.js";
import { MiscSettings } from "./misc-settings.js";
import { CustomizationSettings } from "./customization-settings.js";
import { ExternalModuleSettings } from "./external-module-settings.js";
import { MODULE_NAME } from "../consts.js";

function injectCSS(filename) {
  const head = document.getElementsByTagName("head")[0];
  const mainCss = document.createElement("link");
  mainCss.setAttribute("rel", "stylesheet");
  mainCss.setAttribute("type", "text/css");
  mainCss.setAttribute("href", "modules/pf2e-dorako-ui/styles/" + filename + ".css");
  mainCss.setAttribute("media", "all");
  head.insertBefore(mainCss, head.lastChild);
}

export function refreshChat() {
  if (game.messages.size > 100) {
    return ui.notifications.warn(game.i18n.localize("pf2e-dorako-ui.text.large-chatlog-warning"));
  }
  const messages = game.messages.filter((m) => m instanceof ChatMessage);
  for (const message of messages) {
    ui.chat.updateMessage(message);
  }
}

Hooks.once("init", async () => {
  util.debug("init");

  game.settings.register("pf2e-dorako-ui", "mld-nag", {
    scope: "world",
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register("pf2e-dorako-ui", "tah-nag", {
    scope: "client",
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register("pf2e-dorako-ui", "migration-version", {
    scope: "world",
    config: false,
    default: "0.0.0",
    type: String,
  });

  ThemeSettings.registerSettings();
  AvatarSettings.registerSettings();
  UXSettings.registerSettings();
  MiscSettings.registerSettings();
  CustomizationSettings.registerSettings();
  ExternalModuleSettings.registerSettings();

  // Register API for Module
  game.modules.get(MODULE_NAME).api = {
    excludedApplications: [],
    registerExcludeApplication: (constructorName) => {
      // Get the current list of excluded applications as a set to avoid duplicates
      // Conver to lowercase for case-insensitive comparison
      let excludedApplications = new Set([...game.modules.get(MODULE_NAME).api.excludedApplications, constructorName.toLowerCase()]);
      // Update the setting with the new set as an array
      game.modules.get(MODULE_NAME).api.excludedApplications = Array.from(excludedApplications);
    }
  }

  util.debug("registered settings");

  injectCSS("dorako-ui");
  injectCSS("module-support");
  injectCSS("fonts");

  const root = document.querySelector(":root").style;

  root.setProperty("--avatar-size", game.settings.get("pf2e-dorako-ui", "avatar.size").toString() + "px");

  util.debug("injected sheets");
});

Hooks.once("ready", () => {
  let dorakoCustomCss = document.createElement("style");
  dorakoCustomCss.id = "dorako-custom-css";
  dorakoCustomCss.innerHTML = game.settings.get("pf2e-dorako-ui", "customization.custom-css");
  document.querySelector("head").appendChild(dorakoCustomCss);
});

Hooks.once("ready", () => {
  if (!game.settings.get("pf2e-dorako-ui", "ux.center-hotbar")) return;
  document.getElementById("ui-bottom").classList.add("centered");
});

Hooks.once("ready", () => {
  const frostedGlass = game.settings.get("pf2e-dorako-ui", "theme.frosted-glass");
  if (!frostedGlass) return;
  $("body").addClass("frosted-glass");
  const root = document.querySelector(":root").style;
  root.setProperty("--frosted-glass", frostedGlass);
});

Hooks.once("ready", () => {
  const compactUi = game.settings.get("pf2e-dorako-ui", "ux.compact-ui");
  if (!compactUi) return;
  var body = document.body;
  body.classList.add("compact-ui");
  body.addEventListener("mousemove", toggleActive);

  function toggleActive(e) {
    const offsetLeft = $("body").find("#ui-left")[0] ? $("body").find("#ui-left")[0].offsetLeft : 0;
    if (e.clientX < offsetLeft + 150) {
      $("body").find("#ui-left").addClass("active");
    }
    if (e.clientX > offsetLeft + 200) {
      $("body").find("#ui-left").removeClass("active");
    }
  }
});

Hooks.once("ready", () => {
  if (game.settings.get("pf2e-dorako-ui", "ux.no-logo")) {
    $("#logo")[0].style.setProperty("display", "none", "important");
  }
});

Hooks.once("ready", () => {
  if (game.settings.get("pf2e-dorako-ui", "ux.no-compendium-banner-images")) {
    $("#sidebar").addClass("no-compendium-banner-images");
  }
});

Hooks.on("renderChatLogPF2e", (app, html, data) => {
  if (game.settings.get("pf2e-dorako-ui", "ux.no-chat-control-icon")) {
    html.find("#chat-controls")[0].classList.add("no-chat-control-icon");
  }
});

Hooks.once("ready", () => {
  const glassBg = game.settings.get("pf2e-dorako-ui", "theme.glass-bg");
  if (!glassBg) return;
  const root = document.querySelector(":root").style;
  root.setProperty("--glass-bg", glassBg, "important");
});

Hooks.once("renderSidebar", () => {
  const noCards = game.settings.get("pf2e-dorako-ui", "ux.no-cards");
  if (!noCards) return;
  $(".item[data-tab=cards]").addClass("dorako-display-none");
});
