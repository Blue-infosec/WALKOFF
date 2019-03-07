import { Component, OnInit } from '@angular/core';
import { GridsterConfig, GridType, CompactType } from 'angular-gridster2';
import { InterfaceWidget, BarChartWidget, PieChartWidget, LineChartWidget, TextWidget, KibanaWidget, TableWidget } from '../models/interface/interfaceWidget';
import { Interface } from '../models/interface/interface';
import { InterfaceService } from './interface.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WidgetModalComponent } from './widget.modal.component';

@Component({
    selector: 'manage-interfaces-component',
    templateUrl: './manage.interfaces.component.html',
    styleUrls: ['./manage.interfaces.component.scss']
})
export class ManageInterfacesComponent implements OnInit {

    options: GridsterConfig;

    interface: Interface = new Interface();
    existingInterface = false;

    gridRows = 16;
    gridColumns = 8;
    gridColSize = 75;
    gridGutterSize = 10;
    gridDefaultCols = 3;

    constructor(
        private interfaceService: InterfaceService, 
        private toastrService: ToastrService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal
    ) {}

    ngOnInit() {
        this.activeRoute.params.subscribe(params => {
            if (params.interfaceName) {
                this.existingInterface = true;
                this.interfaceService.getInterfaceWithMetadata(params.interfaceName).then(face => {
                    this.interface = face;
                });
            }

            this.initGrid();
        })
    }

    initGrid() {
        this.options = {
            gridType: GridType.Fixed,
            compactType: CompactType.None,
            pushItems: true,
            draggable: {
                enabled: true
            },
            resizable: {
                enabled: true
            },
            fixedColWidth: this.gridColSize * 4/3,
            fixedRowHeight: this.gridColSize * 3/4,
            minCols: this.gridColumns,
            maxCols: this.gridColumns,
            minRows: 1,
            maxRows: this.gridRows,
            maxItemCols: this.gridColumns,
            minItemCols: 1,
            maxItemRows: this.gridRows,
            minItemRows: 1,
            defaultItemCols: this.gridDefaultCols,
            defaultItemRows: 1
        };
    }

    getGridWidth() {
        return this.gridColumns * Math.ceil(this.gridColSize * 4/3 + this.gridGutterSize) + this.gridGutterSize + 'px';
    }

    getGridHeight() {
        return this.gridRows * Math.ceil(this.gridColSize * 3/4 + this.gridGutterSize) + this.gridGutterSize + 'px';
    }

    changedOptions() {
        this.options.api.optionsChanged();
    }

    editWidget($event: Event, widget) {
        $event.preventDefault();
        const modalRef = this.modalService.open(WidgetModalComponent);
		modalRef.componentInstance.widget = widget;
    }

    removeWidget($event: Event, widget) {
        $event.preventDefault();
        this.interface.widgets.splice(this.interface.widgets.indexOf(widget), 1);
    }

    addWidget(type: string): void {
        let widget: InterfaceWidget;

        switch (type) {
            case "bar":
                widget = new BarChartWidget();
            break;
            case "line":
                widget = new LineChartWidget();
            break;
            case "pie":
                widget = new PieChartWidget();
            break;
            case "text":
                widget = new TextWidget();
            break;
            case "table":
                widget = new TableWidget();
            break;
            case "kibana":
                widget = new KibanaWidget();
            break;
        }

        const modalRef = this.modalService.open(WidgetModalComponent);
		modalRef.componentInstance.widget = widget;
		modalRef.result.then(addedWidget => {
			this.interface.widgets.push(addedWidget);
		}).catch(() => null)
    }
    
    save() {
        if (!this.interface.name) return this.toastrService.error('Enter a name for the interface');

        this.interfaceService.saveInterface(this.interface);
        this.toastrService.success(`"${ this.interface.name }" Saved`);

        this.router.navigate(['/interface', this.interface.name]);
    }

    delete() {
        if(confirm(`Are you sure you want to delete this Interface?`)) {
            const interfaceName = this.interface.name;
            this.interfaceService.deleteInterface(this.interface);
            this.toastrService.success(`"${ interfaceName }" Deleted`);
            this.router.navigate(['/new-interface']);
        }
    }
}