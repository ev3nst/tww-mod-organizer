import { useEffect } from 'react';
import { Spinner } from '@nextui-org/react';
import { observer } from 'mobx-react';

import modFiles from '../../store/modFiles';

const ModConflictInitiator = () => {
    useEffect(() => {
        modFiles.getModConflicts();
    }, []);

    if (modFiles.conflictsLoading !== true) {
        return <></>;
    }

    return (
        <div className="flex-grow text-end">
            <em className="self-end">
                <Spinner size="sm" />
                <span className="ml-2">Processing conflicts...</span>
            </em>
        </div>
    );
};

export default observer(ModConflictInitiator);
