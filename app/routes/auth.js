import router from '../helpers/routes';
import {
	upload
} from '../middleware/uploads';

import {
	SendEmailController,
	RegisterController,
	LoginController,
	LogoutController,
	RefreshAccessTokenController,
} from '../controllers/auth';

router.post('/email_validation', upload.none(), SendEmailController);
router.post('/register', upload.none(), RegisterController);
router.post('/login', upload.none(), LoginController);
router.post('/logout', upload.none(), LogoutController);
router.post('/refresh_accessToken', upload.none(), RefreshAccessTokenController);

module.exports = router;
