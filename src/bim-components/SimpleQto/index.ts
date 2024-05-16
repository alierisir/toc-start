import * as OBC from "openbim-components";
import * as WEBIFC from "web-ifc";
import { FragmentsGroup } from "bim-fragment";
import { QtoQuery } from "./src/QtoQuery";

type QtoResult = { [setName: string]: { [qtoName: string]: number } };

//const sum = {
//  Qto_WallBaseQuantities: {
//    area: 20,
//    volume: 60,
//  },
//};

export class SimpleQto
  extends OBC.Component<QtoResult>
  implements OBC.UI, OBC.Disposable
{
  static uuid = "d7e41a2c-d640-49c1-b2db-538231977020";
  private _components: OBC.Components;
  private _qtoResult: QtoResult = {};
  enabled = true;
  uiElement = new OBC.UIElement<{
    activationBtn: OBC.Button;
    qtoList: OBC.FloatingWindow;
  }>();

  constructor(components: OBC.Components) {
    super(components);
    this._components = components;
    components.tools.add(SimpleQto.uuid, this);
    this.setUi();
  }

  async setup() {
    const highlighter = await this.components.tools.get(
      OBC.FragmentHighlighter
    );
    highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
      await this.resetQuantities();
      //await this.sumQuantities(fragmentIdMap);
      await this.sumQuantitiesV2(fragmentIdMap);
    });

    highlighter.events.select.onClear.add(async () => {
      await this.resetQuantities();
    });
  }

  private setUi() {
    const activationBtn = new OBC.Button(this._components);
    activationBtn.materialIcon = "functions";

    const qtoList = new OBC.FloatingWindow(this._components);
    qtoList.title = "Quantifications";
    this._components.ui.add(qtoList);
    qtoList.visible = false;

    activationBtn.onClick.add(() => {
      activationBtn.active = !activationBtn.active;
      qtoList.visible = activationBtn.active;
    });

    qtoList.onHidden.add(() => {
      activationBtn.active = false;
    });
    this.uiElement.set({ activationBtn, qtoList });
  }

  async resetQuantities() {
    this._qtoResult = {};
    await this.uiElement.get("qtoList").slots.content.dispose(true);
  }

  async sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {
    console.time("Qto summary V1");
    const fragmentManager = await this._components.tools.get(
      OBC.FragmentManager
    );
    for (const fragmentId in fragmentIdMap) {
      const fragment = fragmentManager.list[fragmentId];
      const model = fragment.mesh.parent;
      if (!(model instanceof FragmentsGroup && model.properties)) {
        continue;
      }
      const properties = model.properties;
      OBC.IfcPropertiesUtils.getRelationMap(
        properties,
        WEBIFC.IFCRELDEFINESBYPROPERTIES,
        (setID, relatedID) => {
          const set = properties[setID];
          const expressIDs = fragmentIdMap[fragmentId];
          const workingIDs = relatedID.filter((id) =>
            expressIDs.has(id.toString())
          );
          const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(
            properties,
            setID
          );
          if (
            set.type !== WEBIFC.IFCELEMENTQUANTITY ||
            workingIDs.length === 0 ||
            !setName
          ) {
            return;
          }
          if (!(setName in this._qtoResult)) this._qtoResult[setName] = {};
          OBC.IfcPropertiesUtils.getQsetQuantities(
            properties,
            setID,
            (qtoID) => {
              const { name: qtoName } = OBC.IfcPropertiesUtils.getEntityName(
                properties,
                qtoID
              );
              const { value } = OBC.IfcPropertiesUtils.getQuantityValue(
                properties,
                qtoID
              );
              if (!qtoName || !value) {
                return;
              }
              if (!(qtoName in this._qtoResult[setName])) {
                this._qtoResult[setName][qtoName] = 0;
              }
              this._qtoResult[setName][qtoName] += value;
            }
          );
        }
      );
    }
    this.createTree();
    console.timeEnd("Qto summary V1");
  }

  async sumQuantitiesV2(fragmentIdMap: OBC.FragmentIdMap) {
    console.time("Quantities V2");
    const fragmentManager = await this._components.tools.get(
      OBC.FragmentManager
    );
    const propertiesProcessor = await this._components.tools.get(
      OBC.IfcPropertiesProcessor
    );
    for (const fragmentID in fragmentIdMap) {
      const fragment = fragmentManager.list[fragmentID];
      const model = fragment.mesh.parent;
      if (!(model instanceof FragmentsGroup && model.properties)) {
        continue;
      }
      const properties = model.properties;
      const modelIndexMap = propertiesProcessor.get()[model.uuid];
      if (!modelIndexMap) {
        continue;
      }
      const expressIDs = fragmentIdMap[fragmentID];
      for (const expressID of expressIDs) {
        const entityMap = modelIndexMap[Number(expressID)];
        if (!entityMap) {
          continue;
        }
        for (const mapID of entityMap) {
          const entity = properties[mapID];
          const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(
            properties,
            mapID
          );
          if (!(entity.type === WEBIFC.IFCELEMENTQUANTITY && setName)) {
            continue;
          }
          if (!(setName in this._qtoResult)) {
            this._qtoResult[setName] = {};
          }
          OBC.IfcPropertiesUtils.getQsetQuantities(
            properties,
            mapID,
            (qtoID) => {
              const { name: qtoName } = OBC.IfcPropertiesUtils.getEntityName(
                properties,
                qtoID
              );
              const { value } = OBC.IfcPropertiesUtils.getQuantityValue(
                properties,
                qtoID
              );
              if (!(qtoName && value)) {
                return;
              }
              if (!(qtoName in this._qtoResult[setName])) {
                this._qtoResult[setName][qtoName] = 0;
              }
              this._qtoResult[setName][qtoName] += value;
            }
          );
        }
      }
    }
    this.createTree();
    console.timeEnd("Quantities V2");
  }

  createTree() {
    const qtoList = this.uiElement.get("qtoList");
    for (const key of Object.keys(this._qtoResult)) {
      const query = new QtoQuery(this._components);
      query.title = key;
      query.domElement.style.padding = "5px 0";
      query.domElement.style.fontSize = "20px";
      qtoList.addChild(query);
      for (const queryKey of Object.keys(this._qtoResult[key])) {
        const value = this._qtoResult[key][queryKey];
        const valueString = value.toFixed(3);
        const detailElement = new OBC.SimpleUIComponent(
          this._components,
          `<div style="display:flex; justify-content: space-between;" >${queryKey}:<div style="font-style:italic">${valueString}</div></div>`
        );
        detailElement.domElement.style.padding = "0 10px";
        detailElement.domElement.style.fontSize = "16px";
        query.slots.details.addChild(detailElement);
      }
    }
  }

  get(): QtoResult {
    return this._qtoResult;
  }
  async dispose() {
    await this.resetQuantities();
    await this.uiElement.dispose();
  }
}
