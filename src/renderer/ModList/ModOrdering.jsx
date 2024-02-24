import React from 'react';
import { Chip } from '@nextui-org/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import modFiles from '../../store/modFiles';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

function ModOrder({ modData, index }) {
    return (
        <Draggable draggableId={modData.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Chip
                        key={`mod_order_chip_${modData.id}`}
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
    return mods.map((modData, index) => (
        <ModOrder
            modData={modData}
            index={index}
            key={`mod_order_component_${modData.id}`}
        />
    ));
});

function ModOrdering() {
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

        const mods = Array.from(modFiles.tempModProfileData);
        const [removed] = mods.splice(result.source.index, 1);
        mods.splice(result.destination.index, 0, removed);

        runInAction(() => {
            modFiles.modProfileData = mods;
            modFiles.tempModProfileData = mods;
        });

        modFiles.saveModProfile();
    }

    if (modFiles.tempModProfileData.length > 0) {
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
                        const newModProfileData = [
                            ...modFiles.tempModProfileData,
                        ];
                        const element = newModProfileData.splice(
                            fromIndex,
                            1,
                        )[0];
                        newModProfileData.splice(toIndex, 0, element);
                        const output = newModProfileData.map(
                            (modData) =>
                                modFiles.files.filter(
                                    (mf) => mf.id === modData.id,
                                )[0],
                        );
                        runInAction(() => {
                            modFiles.files = output;
                            modFiles.modProfileData = newModProfileData;
                        });
                    }}
                >
                    <Droppable droppableId="list">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <ModOrderList
                                    mods={modFiles.tempModProfileData}
                                />
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
