import { Router, Request, Response } from 'express';
import * as userService from '../services/user.service';
import { IUserDoc } from '../models/user.model';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const userId: string = req.session && req.session.userId ? req.session.userId : null;
    if (!userId) {
        res.status(401).send();
    }
    const user: IUserDoc | null = await userService.getUser(userId)
        .catch((err) => {
            console.error(err);
            return null;
        });
    if (!user) {
        res.status(401).send();
    } else {
        res.send(user);
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const loginCredentials: ILoginCredentials = req.body;
        const user: IUserDoc | null = await userService.getUserUsingByCredentials(loginCredentials.username, loginCredentials.password)
            .catch((err) => {
                console.error(err);
                return null;
            });
        if (!user) {
            throw new Error('Uživatel s přihlašovacími údaji nanelezen');
        }
        if (req.session) {
            req.session.userId = user?._id || null;
        }
        res.send(user);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/sign-up', (req: Request, res: Response) => {
    const signUpCredentials: ISignUpCredentrials = req.body;
    userService.createUser(
        signUpCredentials.displayName, signUpCredentials.username, signUpCredentials.password    
    ).then((user) => {
        if (req.session) {
            req.session.userId = user?._id || null;
        }
        res.send(user);
    }).catch((err) => {
        console.error(err);
        res.status(500).json({ message: err.message });
    });
});

export default router;

interface ISignUpCredentrials {
    displayName: string;
    username: string;
    password: string;
}

interface ILoginCredentials {
    username: string;
    password: string;
}