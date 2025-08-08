import os

def get_data_config_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    data_yaml_path = os.path.join(script_dir, 'dataset', 'data.yaml')
    
    return data_yaml_path