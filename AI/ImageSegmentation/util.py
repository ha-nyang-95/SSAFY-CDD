import importlib.util


MODEL_NAME_MAP = {
    "segnet": "SegNet",
    "unet": "UNet",
    "fcn": "FCN",
    "deeplab": "DeepLab"
}

def load_module_from_path(module_name, file_path):
    """
        model, hyperparameter 불러올 때 사용
    """

    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module