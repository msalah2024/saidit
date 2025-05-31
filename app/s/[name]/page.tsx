"use client";
import React, { useEffect, useRef, useState } from 'react';
import { faker } from '@faker-js/faker';
import {
    List,
    WindowScroller,
    CellMeasurer,
    CellMeasurerCache,
    AutoSizer
} from "react-virtualized";

type User = {
    username: string;
    email: string;
    bio: string;
};

export default function Page() {
    const cache = useRef(new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 100
    }));

    const [people, setPeople] = useState<User[]>([]);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        function createRandomUser() {
            return {
                username: faker.internet.username(),
                email: faker.internet.email(),
                bio: faker.lorem.lines(Math.random() * 100)
            };
        }

        const users = faker.helpers.multiple(createRandomUser, {
            count: 1,
        });

        setPeople(users);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="border-t">
            {/* <h1>{time.toISOString()}</h1> */}
            <WindowScroller>
                {({ height, isScrolling, scrollTop }) => (
                    <AutoSizer disableHeight>
                        {({ width }) => (
                            <List
                                autoHeight
                                height={height}
                                isScrolling={isScrolling}
                                scrollTop={scrollTop}
                                width={width}
                                rowCount={people.length}
                                deferredMeasurementCache={cache.current}
                                rowHeight={cache.current.rowHeight}
                                rowRenderer={({ key, index, style, parent }) => {
                                    const person = people[index];
                                    return (
                                        <CellMeasurer
                                            key={key}
                                            cache={cache.current}
                                            parent={parent}
                                            columnIndex={0}
                                            rowIndex={index}
                                        >
                                            <div style={{ ...style, padding: '1rem 0' }}>
                                                <div className="px-4 py-2 border rounded-md shadow-sm bg-muted space-y-2">
                                                    <h2 className="text-lg font-semibold">{person.username}</h2>
                                                    <p className="text-sm text-gray-500">{person.bio}</p>
                                                </div>
                                            </div>
                                        </CellMeasurer>
                                    );
                                }}
                            />
                        )}
                    </AutoSizer>
                )}
            </WindowScroller>

        </div>
    );
}
