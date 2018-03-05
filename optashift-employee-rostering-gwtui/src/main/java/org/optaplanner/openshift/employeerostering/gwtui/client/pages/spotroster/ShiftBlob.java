/*
 * Copyright (C) 2018 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.optaplanner.openshift.employeerostering.gwtui.client.pages.spotroster;

import java.time.LocalDateTime;
import java.util.Optional;

import org.optaplanner.openshift.employeerostering.gwtui.client.rostergrid.model.Blob;
import org.optaplanner.openshift.employeerostering.gwtui.client.rostergrid.model.LinearScale;
import org.optaplanner.openshift.employeerostering.shared.employee.Employee;
import org.optaplanner.openshift.employeerostering.shared.shift.Shift;

public class ShiftBlob implements Blob<LocalDateTime> {

    private final Shift shift;
    private final LinearScale<LocalDateTime> scale;
    private Long sizeInGridPixels;

    ShiftBlob(final LinearScale<LocalDateTime> scale, final Shift shift) {
        this.shift = shift;
        this.scale = scale;
        this.sizeInGridPixels = scale.toGridPixels(shift.getTimeSlot().getEndDateTime()) - scale.toGridPixels(getPositionInScaleUnits());
    }

    @Override
    public Long getSizeInGridPixels() {
        return sizeInGridPixels;
    }

    @Override
    public LocalDateTime getPositionInScaleUnits() {
        return shift.getTimeSlot().getStartDateTime();
    }

    @Override
    public void setPositionInScaleUnits(final LocalDateTime start) {
        shift.getTimeSlot().setStartDateTime(start);
    }

    @Override
    public void setSizeInGridPixels(final Long sizeInGridPixels) {
        this.sizeInGridPixels = sizeInGridPixels;
        shift.getTimeSlot().setEndDateTime(getEndPositionInScaleUnits());
    }

    public String getLabel() {
        return Optional.ofNullable(shift.getEmployee())
                .map(Employee::getName)
                .orElse("Unassigned"); //FIXME: i18n
    }

    public Shift getShift() {
        return shift;
    }

    @Override
    public LinearScale<LocalDateTime> getScale() {
        return scale;
    }
}