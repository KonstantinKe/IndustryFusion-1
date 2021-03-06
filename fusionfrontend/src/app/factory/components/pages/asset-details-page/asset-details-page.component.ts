/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject, zip } from 'rxjs';
import { OispService } from 'src/app/services/oisp.service';
import { PointWithId } from 'src/app/services/oisp.model';
import { AssetWithFields } from 'src/app/store/asset/asset.model';
import { Field, QuantityDataType, FieldType } from 'src/app/store/field/field.model';
import { ActivatedRoute } from '@angular/router';
import { AssetQuery } from 'src/app/store/asset/asset.query';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MaintenanceInterval } from '../../content/asset-details/maintenance-bar/maintenance-interval.model';
import { FactoryResolver } from 'src/app/factory/services/factory-resolver.service';
import { ID } from '@datorama/akita';
import { Location as loc } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-asset-details-page',
  templateUrl: './asset-details-page.component.html',
  styleUrls: ['./asset-details-page.component.scss']
})
export class AssetDetailsPageComponent implements OnInit, OnDestroy {
  private unSubscribe$ = new Subject<void>();

  isLoading$: Observable<boolean>;
  asset$: Observable<AssetWithFields>;
  assetId: ID;
  latestPoints$: Observable<PointWithId[]>;
  mergedFields$: Observable<Field[]>;
  hoursTillValue$: Observable<number>;
  maintenanceIntervalValue$: Observable<number>;
  timeSlotOptions = 'current';
  maxPointsOptions: string;
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;

  choiceConfigurationMapping:
    { [k: string]: ChoiceConfiguration } = {
    current: new ChoiceConfiguration(false, false, false, false, false, false),
    oneTimeSlot: new ChoiceConfiguration(true, false, false, true, false, false),
    customDate: new ChoiceConfiguration(true, true, false, true, false, false),
    customDateWithEndDate: new ChoiceConfiguration(true, true, true, true, false, false),
    onOkClick: new ChoiceConfiguration(false, false, false, false, true, false),
    onOkClickShowWarning: new ChoiceConfiguration(false, false, false, false, false, true),
  };
  currentChoiceConfiguration: ChoiceConfiguration = this.choiceConfigurationMapping.current;

  maintenanceValues: MaintenanceInterval = {
    hoursTillMaintenance: null,
    maintenanceInterval: null
  };

  constructor(private assetQuery: AssetQuery,
              private oispService: OispService,
              private routingLocation: loc,
              private factoryResolver: FactoryResolver,
              private datePipe: DatePipe,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading$ = this.assetQuery.selectLoading();
    this.factoryResolver.resolve(this.activatedRoute);
    this.assetId = this.assetQuery.getActiveId();
    this.asset$ = this.factoryResolver.assetWithFields$;

    this.latestPoints$ = this.asset$
      .pipe(
        switchMap(asset => this.oispService.getLastValueOfAllFields(asset, asset.fields, 2))
      );

    this.mergedFields$ = combineLatest([this.asset$, this.latestPoints$])
    .pipe(
      map(([asset, latestPoints]) => {
        return asset.fields.map(field => {
          const fieldCopy = Object.assign({ }, field);
          const point = latestPoints.find(latestPoint => latestPoint.id === field.externalId);

          if (point) {
            fieldCopy.value = point.value;
            console.log('[asset-details-page.component] matched field and point');
          }
          return fieldCopy;
        });
      }),
      tap(fields => console.log(fields))
    );

    this.hoursTillValue$ = this.mergedFields$.pipe(
      map(fields => {
        const filteredFields = fields.filter(field => field.description === 'Hours till maintenance');
        if (filteredFields.length > 0) {
          return parseInt(filteredFields.find(field => field.description === 'Hours till maintenance')?.value, 10);
        }
      })
    );

    this.maintenanceIntervalValue$ = this.mergedFields$.pipe(
      map(fields => {
        const filteredFields = fields.filter(field => field.description === 'Maintenance interval');
        if (filteredFields.length > 0) {
          return parseInt(filteredFields.find(field => field.description === 'Maintenance interval')?.value, 10)
        }
      })
    );

    zip(this.hoursTillValue$,
        this.maintenanceIntervalValue$
    )
      .pipe(
        takeUntil(this.unSubscribe$)
      ).subscribe(values => {
        this.maintenanceValues.hoursTillMaintenance =  isNaN(values[0]) ?  0 : values[0];
        this.maintenanceValues.maintenanceInterval = isNaN(values[1]) ?  0 : values[1];
      });
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  setOptions(key: string,
             validateOptions: boolean = false) {
    if (validateOptions) {
      if (!this.maxPointsOptions) {
        this.currentChoiceConfiguration = this.choiceConfigurationMapping.onOkClickShowWarning;
        console.log('current Choices show warning: ' + this.currentChoiceConfiguration.showWarning);
        return;
      } else {
        if (this.timeSlotOptions === 'customDate') {
          if (!(this.startDate && this.endDate)) {
            this.currentChoiceConfiguration = this.choiceConfigurationMapping.onOkClickShowWarning;
            return;
          }
        }
      }
    }
    this.currentChoiceConfiguration = this.choiceConfigurationMapping[key];
  }

  resetOptions() {
    if (this.timeSlotOptions === 'customDate') {
      this.currentChoiceConfiguration = this.choiceConfigurationMapping.customDate;
    } else {
      this.currentChoiceConfiguration = this.choiceConfigurationMapping.oneTimeSlot;
    }
  }

  setMinAndMaxDate(date: string) {
    const localDate: moment.Moment = moment(date);
    this.minDate =  this.datePipe.transform(localDate, 'yyyy-MM-dd');
    this.maxDate = this.datePipe.transform(moment(localDate).add(2, 'days'), 'yyyy-MM-dd');
    this.currentChoiceConfiguration = this.choiceConfigurationMapping.customDateWithEndDate;
  }

  rangeChange(event) {
    console.log(event.target.value);
  }

  hasTypeCategorical(field: Field): boolean {
    return field.quantityDataType === QuantityDataType.CATEGORICAL;
  }

  hasTypeNumeric(field: Field): boolean {
    return field.quantityDataType === QuantityDataType.NUMERIC;
  }

  isNotAttribute(field: Field) {
    return (field.type !== FieldType.ATTRIBUTE);
  }

  goBack() {
    this.routingLocation.back();
  }
}

class ChoiceConfiguration{
  chooseMaxPoints = false;
  chooseStartDate = false;
  chooseEndDate = false;
  chooseButton = false;
  clickedOk = false;
  showWarning = false;

  constructor(chooseMaxPoints: boolean,
              chooseStartDate: boolean,
              chooseEndDate: boolean,
              chooseButton: boolean,
              clickedOk: boolean,
              showWarning: boolean) {
    this.chooseMaxPoints = chooseMaxPoints;
    this.chooseStartDate = chooseStartDate;
    this.chooseButton = chooseButton;
    this.clickedOk = clickedOk;
    this.chooseEndDate = chooseEndDate;
    this.showWarning = showWarning;
  }
}
