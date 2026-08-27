import modules.scripts as scripts

class FluidForgeUI(scripts.Script):
    def title(self):
        return "Fluid Forge UI"

    def show(self, is_img2img):
        return scripts.AlwaysVisible
