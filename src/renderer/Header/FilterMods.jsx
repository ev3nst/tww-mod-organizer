import { Input } from '@nextui-org/react';
import { Search } from '../Icons';

import { observer } from 'mobx-react';
import { debounceEffect } from '../../helpers/util';
import { runInAction } from 'mobx';
import modFiles from '../../store/modFiles';
import { useEffect, useState } from 'react';

const FilterMods = () => {
    const [searchString, setSearchString] = useState('');

    useEffect(() => {
        runInAction(() => {
            modFiles.searchFilter = searchString;
        });
    }, [searchString]);

    return (
        <Input
            classNames={{
                base: 'max-w-full sm:max-w-[20rem] h-10 mr-5',
                mainWrapper: 'h-full',
                input: 'text-small',
                inputWrapper:
                    'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
            }}
            placeholder="Type to search..."
            size="sm"
            startContent={<Search size={18} />}
            type="search"
            onValueChange={(value) => {
                debounceEffect(
                    (() => {
                        setSearchString(value);
                    })(),
                    500,
                );
            }}
        />
    );
};

export default observer(FilterMods);
