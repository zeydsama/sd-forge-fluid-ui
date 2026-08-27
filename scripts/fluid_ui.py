import gradio as gr
import modules.scripts as scripts
from modules import shared
from modules import script_callbacks

def on_ui_settings():
    section = ("fluid_forge", "Fluid Forge")
    section_hide = ("fluid_forge_hide", "Fluid Forge: UI Hide")

    shared.opts.add_option(
        "fluid_ui_theme",
        shared.OptionInfo(
            "Codex", 
            "UI Theme",
            gr.Radio,
            {"choices": ["Codex", "Dark Tech", "Gradio Base"]},
            section=section
        ).info("Select the aesthetic theme for the UI. (Reload UI to apply)")
    )
    shared.opts.add_option(
        "fluid_ui_bone",
        shared.OptionInfo(
            "Codex v1", 
            "UI Bone",
            gr.Radio,
            {"choices": ["Legacy Fluid Forge", "Codex v1"]},
            section=section
        ).info("Select the layout bone architecture: Legacy Fluid Forge (standard stack) or Codex v1 (compact bento cockpit). (Reload UI to apply)")
    )
    shared.opts.add_option(
        "fluid_ui_hide_seed_batch",
        shared.OptionInfo(
            False,
            "Hide Seed & Batching Panel",
            gr.Checkbox,
            section=section_hide
        ).info("Hides the '3. Seed & Batching' panel in Codex v1 Cockpit to maximize workspace.")
    )

script_callbacks.on_ui_settings(on_ui_settings)

class FluidForgeUI(scripts.Script):
    def title(self):
        return "Fluid Forge UI"

    def show(self, is_img2img):
        return scripts.AlwaysVisible
