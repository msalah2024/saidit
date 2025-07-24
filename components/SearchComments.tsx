import React, { memo } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';


const SearchComments = () => {
    return (
        <div className='relative'>
            <Input type="text" placeholder="Search Comments" className='pl-8' />
            <Search className='text-muted-foreground absolute top-2 left-2' size={20} />
        </div>
    );
};

export default memo(SearchComments); 