import React, { useEffect, useState } from 'react';
import { Chip } from '@nextui-org/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import modFiles from '../../store/modFiles';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

function ModOrder({ modIndex, index }) {
    return (
        <Draggable draggableId={modIndex} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Chip
                        key={modIndex}
                        size="lg"
                        style={{
                            height: '30px',
                            marginTop: '5px',
                            marginBottom: '5px',
                        }}
                    >
                        <EllipsisHorizontalIcon width={15} height={15} />
                    </Chip>
                </div>
            )}
        </Draggable>
    );
}

const ModOrderList = React.memo(function ModOrderList({ mods }) {
    return mods.map((modIndex, index) => (
        <ModOrder modIndex={modIndex} index={index} key={modIndex} />
    ));
});

function ModOrdering() {
    const modFilesData = toJS(modFiles);
    const modOrderingData = modFilesData.tempOrdering;
    const [modOrderingState, setModOrderingState] = useState([]);

    useEffect(() => {
        if (modOrderingState.length === 0) {
            setModOrderingState(modFilesData.tempOrdering);
        }
    }, [modFilesData.tempOrdering, modOrderingData, modOrderingState.length]);

    function onDragEnd(result) {
        runInAction(() => {
            modFiles.draggingId = null;
        });

        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const mods = reorder(
            modOrderingState,
            result.source.index,
            result.destination.index,
        );

        setModOrderingState(mods);
        const fromIndex = result.source.index;
        const toIndex = result.destination.index;
        const newOrderData = [...modOrderingData];
        const element = newOrderData.splice(fromIndex, 1)[0];
        newOrderData.splice(toIndex, 0, element);
        runInAction(() => {
            modFiles.ordering = newOrderData;
            modFiles.tempOrdering = newOrderData;
        });
    }

    if (modOrderingState.length > 0) {
        return (
            <div className="mt-11 px-4">
                <DragDropContext
                    onDragStart={(dragEvent) => {
                        runInAction(() => {
                            modFiles.draggingId = dragEvent.draggableId;
                        });
                    }}
                    onDragEnd={onDragEnd}
                    onDragUpdate={(update) => {
                        if (
                            update.source === null ||
                            update.destination === null
                        ) {
                            return;
                        }

                        const fromIndex = update.source.index;
                        const toIndex = update.destination.index;
                        const newOrderData = [...modOrderingData];
                        const element = newOrderData.splice(fromIndex, 1)[0];
                        newOrderData.splice(toIndex, 0, element);
                        const output = newOrderData.map(
                            (id) =>
                                modFilesData.files.filter(
                                    (mf) => mf.id === id,
                                )[0],
                        );
                        runInAction(() => {
                            modFiles.files = output;
                            modFiles.ordering = newOrderData;
                        });
                    }}
                >
                    <Droppable droppableId="list">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <ModOrderList mods={modOrderingState} />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }

    return <></>;
}

export default observer(ModOrdering);
