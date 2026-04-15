import {Link} from 'react-router-dom'
import useAuthStore from '../hook/useAuthStore'
import { LogOut, Menu, Settings, User } from 'lucide-react'
import FluxChatLogo from './FluxChatLogo'

const Navbar = () => {
  const {logout, authUser} = useAuthStore()

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="flex items-center justify-center">
                <FluxChatLogo className="size-8 text-primary" />
              </div>
              <h1 className="text-lg font-bold">FluxChat</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/setting" className="btn btn-sm gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              {authUser && (
                <>
                  <Link to="/profile" className="btn btn-sm gap-2">
                    <User className="size-5" />
                    <span>Profile</span>
                  </Link>

                  <button className="btn btn-sm gap-2" onClick={logout}>
                    <LogOut className="size-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            <div className="dropdown dropdown-end sm:hidden">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-square"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-48 border border-base-300"
              >
                <li>
                  <Link to="/setting" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </li>

                {authUser && (
                  <>
                    <li>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="size-4" />
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <button onClick={logout} className="flex items-center gap-2">
                        <LogOut className="size-4" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar