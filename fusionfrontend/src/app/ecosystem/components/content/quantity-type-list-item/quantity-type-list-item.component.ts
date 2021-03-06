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

import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseListItemComponent } from '../base/base-list-item/base-list-item.component';
import { QuantityService } from '../../../../store/quantity/quantity.service';
import { Quantity } from '../../../../store/quantity/quantity.model';

@Component({
  selector: 'app-quantity-type-list-item',
  templateUrl: './quantity-type-list-item.component.html',
  styleUrls: ['./quantity-type-list-item.component.scss']
})
export class QuantityTypeListItemComponent extends BaseListItemComponent implements OnInit {

  @Input()
  item: Quantity;

  constructor(public route: ActivatedRoute, public router: Router, public quantityService: QuantityService) {
    super(route, router, quantityService);
  }

  ngOnInit() {
  }

}
