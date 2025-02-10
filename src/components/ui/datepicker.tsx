// src/components/ui/datepicker.tsx
"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  selected: string | null;
  onChangeAction: (date: string | null) => void;
}

const DatePickerComponent: React.FC<DateTimePickerProps> = ({ selected, onChangeAction }) => {
  return (
    <DatePicker
      selected={selected ? new Date(selected) : null}
      onChange={(date: Date | null) => onChangeAction(date ? date.toISOString() : null)}
      showTimeSelect
      timeIntervals={15}
      dateFormat="Pp"
      timeCaption="Time"
      className="border p-2 rounded"
      minDate={new Date()}
    />
  );
};

export default DatePickerComponent; // default export
