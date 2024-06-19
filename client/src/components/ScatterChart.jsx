import React, { useState, useEffect } from 'react';
import './styles.css'; 

const getCategoryColor = (categoryName) => {
    switch (categoryName) {
        case "SNAPSHOT":
            return "#87CEEB"; // Blue
        case "BACKUP":
            return "#90EE90"; // Green
        case "CLOUD_BACKUP":
            return "#FFFF00"; // Yellow
        default:
            return "#000000"; 
    }
};

// Grid component
function Grid({ categories, timeIntervals, occurrences, onCellHover }) {
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [hovered, setHovered] = useState(null);

    const handleMouseEnter = (currentId, currentTime, sourceId, sourceTime) => {
        setCurrentSchedule({ currentId, currentTime, sourceId, sourceTime });
        setHovered({ sourceId, sourceTime });
    };

    const handleMouseLeave = () => {
        setCurrentSchedule(null);
        setHovered(null);
    };

    return (
        <div className="grid-container">
            <div className="grid">
                <div className="grid-row">
                    <div className="grid-cell header fixed-cell">Category</div>
                    <div className="grid-cell header fixed-cell-2">IDs</div>
                    {timeIntervals.map((interval, index) => (
                        <div key={index} className="grid-cell header time">
                            {interval.startTime}
                        </div>
                    ))}
                </div>

                {categories.map(category => {
                    if (category.name !== "SNAPSHOT" && category.name !== "BACKUP" && category.name !== "CLOUD_BACKUP") {
                        return null; 
                    }
                    return (
                        <div key={category.id} className="grid-row">
                            <div className="grid-cell header fixed-cell">{category.name}</div>
                            <div className="grid-cell header fixed-cell-2">{category.id}</div> {/* Displaying the schedule ID */}
                            {timeIntervals.map(timeInterval => {
                                const occurrencesInCell = occurrences.filter(occurrence =>
                                    occurrence.id === category.id &&
                                    occurrence.time.includes(timeInterval.startTime)
                                );
                                return (
                                    <div
                                        key={timeInterval.startTime}
                                        className="grid-cell"
                                        onMouseEnter={() => onCellHover(category.id, timeInterval.startTime, occurrencesInCell)}
                                    >
                                        {occurrencesInCell.map((occurrence, index) => (
                                            <div
                                                key={index}
                                                className="circle"
                                                onMouseEnter={() => handleMouseEnter(occurrence.id, occurrence.time, occurrence.source_id, occurrence.source_time)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <svg
  width={hovered?.sourceId === occurrence.id && hovered?.sourceTime === occurrence.time ? "40" : "30"}
  height={hovered?.sourceId === occurrence.id && hovered?.sourceTime === occurrence.time ? "40" : "30"}
>
  <circle
    cx="20"
    cy="20"
    r={hovered?.sourceId === occurrence.id && hovered?.sourceTime === occurrence.time ? "15" : "10"}
    fill={getCategoryColor(category.name)}
    stroke={hovered?.sourceId === occurrence.id && hovered?.sourceTime === occurrence.time ? "#555" : "none"} /* Outline color */
    strokeWidth="2" /* Outline width */
  />
</svg>

                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BackupScheduleVisualization(data) {
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredOccurrences, setFilteredOccurrences] = useState([]);
    const response = data

    const occurrences = response.data.map(entry => entry.occurrences).flat();

    const categories = response.data.reduce((acc, curr) => {
        const schedules = curr.schedules_involved.map(schedule => ({
            id: schedule.id,
            name: schedule.type
        }));
        schedules.forEach(schedule => {
            if (!acc.some(category => category.id === schedule.id)) {
                acc.push(schedule);
            }
        });
        return acc;
    }, []);

    const handleCellHover = (currentId, currentTime, occurrencesInCell) => {
        const occurrenceDetails = occurrencesInCell.map(occurrence => ({
            scheduleId: occurrence.id,
            scheduleTime: occurrence.time,
            sourceScheduleId: occurrence.source_id,
            sourceScheduleTime: occurrence.source_time,
        }));
        setCurrentSchedule({ currentId, currentTime, occurrenceDetails });
    };

    const handleFilter = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const filtered = occurrences.filter(occurrence => {
                const occurrenceTime = new Date(occurrence.time);
                return occurrenceTime >= start && occurrenceTime <= end;
            });
            setFilteredOccurrences(filtered);
        }
    };

    const timeIntervals = [...new Set(filteredOccurrences.map(occurrence => occurrence.time))].map(time => ({
        startTime: time
    }));

    return (
        <div className="visualization">
            <h2>Backup Schedule Visualization</h2>
            <div className="date-time-input">
                <label>
                    Start Date and Time:
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </label>
                <label>
                    End Date and Time:
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>
                <button className="filter-button" onClick={handleFilter}>Filter</button>
            </div>
            {startDate && endDate && (
                <>
                    <Grid categories={categories} timeIntervals={timeIntervals} occurrences={filteredOccurrences} onCellHover={handleCellHover} />
                    
                    {currentSchedule && (
                        <div className="details">
                            <h3 className="heading">SCHEDULE DETAILS</h3>
                            {currentSchedule.occurrenceDetails.map((detail, index) => (
                                <div key={index} className="detail">
                                    <div className="detail-item"><span className="label">Schedule ID:</span> {detail.scheduleId}</div>
                                    <div className="detail-item"><span className="label">Schedule Time:</span> {detail.scheduleTime}</div>
                                    <div className="detail-item"><span className="label">Source Schedule ID:</span> {detail.sourceScheduleId}</div>
                                    <div className="detail-item"><span className="label">Source Schedule Time:</span> {detail.sourceScheduleTime}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default BackupScheduleVisualization;
