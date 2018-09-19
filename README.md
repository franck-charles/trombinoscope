# Trombinoscope

Display a trombinoscope (organization chart with photographs) from Json/Yaml file.

See demo : [Trombinoscope (démo)](http://www.trombinoscope.ovh/ "Trombinoscope (démo)")

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

None

### YAML file
```
USERS:
  fcharles:
    name: Franck CHARLES
    departments:
    - R&D department
    title: Software engineer
    location: Paris
    phone: "06123456789"
  tdupond:
    name: Thierry Dupont
    departments:
    - Human resources
    title: Human resources department
    location: Marseille
    phone: "06999999999"
```
### Convert YAML to JSON
1. Use [YAML to JSON converter](http://convertjson.com/yaml-to-json.htm)
1. Use Python:
```
import yaml
import json

employees_yaml = yaml.load(open('employees.yaml', 'rb').read())
open('employees.json', 'wb').write(json.dumps(employees_yaml))
```
