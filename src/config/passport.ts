import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserService } from '../services/userService';
import { JwtUtil } from '../utils/jwt';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

// JWT 전략 설정
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
}, async (payload, done) => {
  try {
    const user = await UserService.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Local 전략 설정 (로그인용)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await UserService.findByEmail(email);
    if (!user) {
      return done(null, false, { message: '이메일 또는 비밀번호가 잘못되었습니다' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: '이메일 또는 비밀번호가 잘못되었습니다' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// 사용자 직렬화
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 사용자 역직렬화
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserService.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 