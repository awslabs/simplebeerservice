from grovepi import grovepi
from grove_sensor import GroveSensor

# Flow Sensor class is the implementation of the Flow Sensor logic.
# The flow sensor is either in the position 0 or 1. Flow is determined by the
# amount of change in this value.
THRESHOLDS = {
    'stop': 5,
    'start': 2
}

class GroveFlowSensor(GroveSensor):

    def __init__(self, pin):
        super(GroveFlowSensor,self).__init__(pin, "Flow Sensor")
        self.flowing = False
        self.last_flow_reading = None
        self.flow_counters = {
            'stop': 0,
            'start': 0
        }
        self.flow_count = 0

    # This will return the current flow count.
    def get_flow_count(self):
        return self.flow_count
        #return grovepi.digitalRead(self.pin)

    def is_flowing(self):
        return self.flowing

    def reset_flow_count(self):
        self.flow_count = 0

    # During a reading, this function will check the flow_stop_counter to determine if the flow has stopped.
    # It does this by checking if the reading from the sensor has been the same for the past 8 interations.
    # If so, it will change the flowing flag to false.
    def read(self):
        current_reading = grovepi.digitalRead(self.pin)
        if self.last_flow_reading != current_reading:
            self.flow_counters['stop'] = 0
            self.flow_counters['start'] += 1
            self.last_flow_reading = current_reading
            if (self.flow_counters['start'] >= THRESHOLDS['start']):
                self.flowing = True
        else:
            self.flow_counters['stop'] += 1

        if self.flowing:
            self.flow_count += 1

        if self.flow_counters['stop'] > THRESHOLDS['stop'] and self.flow_count > 0:
            self.flow_counters['start'] = 0
            self.flow_counters['stop'] = 0
            self.flowing = False
            self.flow_count = 0
        return current_reading
