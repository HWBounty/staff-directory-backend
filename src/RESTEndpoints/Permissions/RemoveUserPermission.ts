import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';
import { isAdminOfCommunity } from '../../Helpers/PermissionsChecker';
import { STAFF_DIRECTORY_PERMISSION_SCOPE } from '../../Utils/constants';

export const GetGame = {
  path: '/*/staffDirectory/permissions',
  method: RESTMethods.DELETE,
  sendUser: false,
  run: async (req, res, next, user) => {
    const communityID = req.params[0];

    if (!communityID) {
      return res.status(400).send('No Community Passed In');
    }
    if (!req.body.everyone && !req.body.user) {
      return res.status(400).send('Cannot remove the permission from anyone');
    }

    if (!req.body.permission) {
      return res.status(400).send('No Permission Sent');
    }

    if (!user) {
      return res.status(401).send('Unknown User');
    }

    const isAdmin = await isAdminOfCommunity(user.id, communityID);

    if (isAdmin == null) {
      return res.status(404).send('Community not found');
    } else if (!isAdmin) {
      return res.status(403).send('Unauthorized');
    }

    if (
      !req.body.permission.startsWith(`${STAFF_DIRECTORY_PERMISSION_SCOPE}.`)
    ) {
      return res
        .status(403)
        .send(
          `Cannot remove a permission outside of scope ${STAFF_DIRECTORY_PERMISSION_SCOPE}`
        );
    }

    if (!!req.body.everyone) {
      globalThis.AuthManager.removeUserPermission(
        '_@everyone',
        req.body.permission,
        communityID
      );
    } else {
      globalThis.AuthManager.removeUserPermission(
        req.body.user,
        req.body.permission,
        communityID
      );
    }

    res.status(201).send(req.body.permission);
    return;
  },
} as RESTHandler;
export default GetGame;
