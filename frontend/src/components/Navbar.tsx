import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice'; 

const Navbar = () => {
    // 3Hook: useLocation to get current URL, get dispatch from redux and clear data when loggout; useNavigate get jump func 
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () =>{
        dispatch(logout()); // 1: clear redux's token and user info
        navigate('/login'); // 2: dirctect to login
    };
    // use array better than <link>, no need touch render logic if new pages need added in future
    const navItems = [
        { label: 'Personal Information', path: '/employee/profile' },
        { label: 'Visa Status Management', path: '/employee/visa-status' },
    ];

    // ======= RENDER
    return (
        <nav className="w-48 min-h-screen bg-white border-r border-gray-200 p-4 flex flex-col">
            {/*Logo area */}
            <div className= "mb-6 pb-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">myHR Portal</p>
                <p className="text-xs text-gray-500 mt-0.5">Employee</p>
            </div>
            {/*Menua area */}
            <div className="flex flex-col gap-1 flex-1">
                {navItems.map(item => (
                // location.pathname matches item.path → blue highlight, otherwise grey
                <Link key={item.path} to={item.path}  
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        location.pathname === item.path
                            ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                        {item.label}
                    </Link>
                    ))}
            </div>

            <button onClick= {handleLogout}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg text-left mt-auto">
                    Logout</button>
  </nav>
  );
};
export default Navbar;