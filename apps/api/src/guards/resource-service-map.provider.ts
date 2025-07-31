import { DeploymentService } from 'src/modules/deployment/service/deployment.service';
import { RESOURCE_SERVICE_MAP } from './ownership.guard'; // someone ask for RESOURCE_SERVICE_MAP give them this object
import { UsersService } from 'src/modules/users/users.service';

export const ResourceServiceMapProvider = {
  provide: RESOURCE_SERVICE_MAP,
  useFactory: (
    usersService: UsersService,
    deploymentService: DeploymentService,
  ) => {
    return {
      user: { service: usersService, ownerField: 'id' },
      deployment: { service: deploymentService, ownerField: 'userId' },
    };
  },
  inject: [UsersService, DeploymentService], // it means , before you run this factory function, please give me an instance of UsersService. // all get injected in order but we define which srvice is which in factory so no worry
};

// please not that they are all shared instances meaning the useFactory is also getting same instance copy of userservice as usercontroller
