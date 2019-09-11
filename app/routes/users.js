import router from '../helpers/routes';
import authChecker from '../middleware/auth';

import {
	GetAllUsers,
	GetUser,
	EditUser,
	GetUserDetails,
} from '../controllers/users';
import { uploadImages } from '../middleware/uploads';

// <--'/user/edit'--> should use multer (upload.none() for parsing body STRING data from Front-end)
router.post('/user/edit', [uploadImages.single('avatar') , authChecker], EditUser);
router.get('/users', GetAllUsers);
router.get('/user/details', GetUserDetails);
router.get('/user/:id',  GetUser);

module.exports = router;
