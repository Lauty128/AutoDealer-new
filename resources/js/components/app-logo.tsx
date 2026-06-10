import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className="flex items-center gap-2 overflow-hidden">
            {isCollapsed ? (
                /* Collapsed: show only the square shield icon logo */
                <div className="flex items-center py-1">
                    <img
                        src="/assets/logo.png"
                        alt="AutoDealer"
                        className="h-100 object-contain dark:hidden"
                    />
                    <img
                        src="/assets/logo-dark.png"
                        alt="AutoDealer"
                        className="h-100 object-contain hidden dark:block"
                    />
                </div>

            ) : (
                /* Expanded: show full horizontal logo */
                <div className="flex items-center py-1">
                    <img
                        src="/assets/logo-h.png"
                        alt="AutoDealer"
                        className="h-100 object-contain dark:hidden"
                    />
                    <img
                        src="/assets/logo-h-dark.png"
                        alt="AutoDealer"
                        className="h-100 object-contain hidden dark:block"
                    />
                </div>
            )}
        </div>
    );
}
