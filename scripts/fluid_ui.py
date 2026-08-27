import gradio as gr
import modules.scripts as scripts
from modules import shared
from modules import script_callbacks

def on_ui_settings():
    section = ("fluid_forge", "Fluid Forge")

    shared.opts.add_option(
        "fluid_ui_theme",
        shared.OptionInfo(
            "Native Fluid",
            "UI Theme",
            gr.Radio,
            {"choices": ["Native Fluid", "Pure Gradio"]},
            section=section
        ).info("Select the UI aesthetic theme: Native Fluid (Codex Studio Dark) or Pure Gradio (Default Gradio theme). (Reload UI to apply)")
    )

script_callbacks.on_ui_settings(on_ui_settings)

class FluidForgeUI(scripts.Script):
    def title(self):
        return "Fluid Forge UI"

    def show(self, is_img2img):
        return scripts.AlwaysVisible
