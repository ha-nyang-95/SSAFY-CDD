from SegNet.model import SegNetLightning
from DeepLab.model import DeepLabV3Lightning
from UNet.model import UNetLightning
from FCN.model import FCN8sLightning

def get_segmentation_model(model_name: str, **kwargs):
    model_name_lower = model_name.lower()
    if model_name_lower == 'deeplab':
        return DeepLabV3Lightning(**kwargs)
    elif model_name_lower == 'segnet':
        return SegNetLightning(**kwargs)
    elif model_name_lower == 'unet':
        return UNetLightning(**kwargs)
    elif model_name_lower == 'fcn':
        return FCN8sLightning(**kwargs)
    else:
        raise ValueError(f"Model {model_name} not supported.")