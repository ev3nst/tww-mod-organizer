import React, { useState } from 'react';
import { Chip } from '@nextui-org/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';

const initial = Array.from({ length: 10 }, (v, k) => k).map((k) => {
    const custom = {
        id: `id-${k}`,
        content: `${k}`,
    };

    return custom;
});

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

function Quote({ quote, index }) {
    return (
        <Draggable draggableId={quote.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Chip
                        key={quote.id}
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

const QuoteList = React.memo(function QuoteList({ quotes }) {
    return quotes.map((quote, index) => (
        <Quote quote={quote} index={index} key={quote.id} />
    ));
});

function ModOrdering() {
    const [state, setState] = useState({ quotes: initial });

    function onDragEnd(result) {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const quotes = reorder(
            state.quotes,
            result.source.index,
            result.destination.index,
        );

        setState({ quotes });
    }

    return (
        <div className="mt-11 px-4">
            <DragDropContext
                onDragEnd={onDragEnd}
                onDragUpdate={(update) => {
                    console.log(update, 'update?');
                }}
            >
                <Droppable droppableId="list">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <QuoteList quotes={state.quotes} />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

export default ModOrdering;
