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
    

def get_segmentation_model_class(model_name: str):
    model_map = {
        'deeplab': DeepLabV3Lightning,
        'segnet': SegNetLightning,
        'unet': UNetLightning,
        'fcn': FCN8sLightning,
    }
    name = model_name.lower()
    if name not in model_map:
        raise ValueError(f"지원하지 않는 모델명: {model_name}")
    return model_map[name]