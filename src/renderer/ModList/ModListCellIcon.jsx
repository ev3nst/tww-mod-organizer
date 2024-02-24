import { Image } from '@nextui-org/react';
import { FolderIcon } from '@heroicons/react/24/solid';

import steamLogo from '../../../assets/steam-logo.png';
import nexusLogo from '../../../assets/nexus-logo.png';

const ModListCellIcon = ({ row }) => {
    if (typeof row.steamId !== 'undefined') {
        return <Image src={steamLogo} width={20} height={20} />;
    }

    if (typeof row.nexusId !== 'undefined') {
        return <Image src={nexusLogo} width={20} height={20} />;
    }

    return <FolderIcon width={20} height={20} />;
};

export default ModListCellIcon;
