import Login from './Login';

// Register simply renders Login component with register mode
export default function Register() {
    return <Login initialMode="register" />;
}
