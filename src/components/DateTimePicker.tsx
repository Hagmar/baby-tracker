import React, { useState } from "react";

interface DateTimePickerProps {
  initialDate: Date;
  onSave: (date: Date) => void;
  onCancel: () => void;
  hideButtons?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  initialDate,
  onSave,
  onCancel,
  hideButtons = false,
}) => {
  const [date, setDate] = useState(
    initialDate.toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [time, setTime] = useState(
    initialDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  const handleChange = () => {
    const newDate = new Date(`${date}T${time}`);
    onSave(newDate);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (hideButtons) {
      const newDateTime = new Date(`${newDate}T${time}`);
      onSave(newDateTime);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (hideButtons) {
      const newDateTime = new Date(`${date}T${newTime}`);
      onSave(newDateTime);
    }
  };

  return (
    <div className="datetime-picker">
      <input
        type="date"
        value={date}
        onChange={(e) => handleDateChange(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => handleTimeChange(e.target.value)}
      />
      {!hideButtons && (
        <div className="modal-actions">
          <button className="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button" onClick={handleChange}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
