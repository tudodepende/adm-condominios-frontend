import React, { PureComponent } from "react";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import VisitaService from "../../../services/VisitaService";
import ApartamentoService from "../../../services/ApartamentoService";
import VisitanteService from "../../../services/VisitanteService";
import Functions from "../../../resources/Functions";
import Paginator from "../../Paginator/Paginator";
import { LIMITE } from "../../../resources/Config";

class ListVisitaComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visitas: [],
      infoApto: [],
      infoVisitante: [],
      paginas: {
        pagina: 1,
        limite: LIMITE
      }
    };

    this.addVisita = this.addVisita.bind(this);
    this.putVisita = this.putVisita.bind(this);
    this.deleteVisita = this.deleteVisita.bind(this);
    this.viewVisita = this.viewVisita.bind(this);
  }

  componentDidMount() {
    this.coletarDados(this.state.paginas.pagina);
  }

  coletarDados = (paginaAtual) => {
    let mapaAptos = new Map();
    let mapaNomes = new Map();
    let listaDeVisitas = [];

    VisitaService.getVisitasPaginadas(paginaAtual, LIMITE)
    .then(res => {
      if (res.data.resultados.length === 0) {
        throw new Error("Nenhum registro encontrado");
      }
      let total = Math.ceil(res.data.paginas.total / LIMITE);
      this.setState({
        paginas: {
          pagina: paginaAtual,
          limite: LIMITE,
          total: total
        }
      });
      listaDeVisitas = res.data.resultados;
    })
    .then(async () => {
      await this.mapearApartamentos(mapaAptos, listaDeVisitas);
    })
    .then(async () => {
      await this.mapearVisitantes(mapaNomes, listaDeVisitas);
    })
    .then(() => {
      this.converterDados(listaDeVisitas, mapaAptos, mapaNomes);
    })
    .then(() => {
      this.setState({ visitas: listaDeVisitas });
    })
    .catch((e) => {
      console.log(e);
    });  
  }

  mapearApartamentos = async (mapa, array) => {
    array.forEach(dado => {
      mapa.set(dado.apartamento, "");
    });
    const arrayApartamentos = Array.from(mapa.keys());
    if (arrayApartamentos[0]) {
      await ApartamentoService.getApartamentosByList(arrayApartamentos)
      .then(res => {
        res.data.forEach(dado => {
          mapa.set(dado.id, dado.numero +"-"+ dado.torre);
        });    
      });
    }
  }

  mapearVisitantes = async (mapa, array) => {
    array.forEach(dado => {
      mapa.set(dado.visitante, "");
    });
    const arrayVisitantes = Array.from(mapa.keys());
    await VisitanteService.getVisitantesByList(arrayVisitantes)
      .then(res => {
        res.data.forEach(dado => {
          mapa.set(dado.id, dado.nome);
        });    
    });
  }

  converterDados = (array, mapaAptos, mapaNomes) => {
    for (const key in array) {
      const nome = mapaNomes.get(array[key].visitante);
      const apto = mapaAptos.get(array[key].apartamento);
      array[key].visitante = nome;
      array[key].apartamento = apto;
      array[key].data = Functions.dataFromDbToScreen(array[key].data);
    };
  }

  addVisita = () => {
    this.props.history.push("/gerenciar-visita/novo");
  };

  putVisita = (id) => {
    this.props.history.push(`/gerenciar-visita/${id}`);
  };

  deleteVisita = (id) => {
    let visita = this.state.visitas.filter(item => item.id === id);
    if (
      window.confirm(`Deseja realmente excluir a visita de ${visita[0].visitante} no dia ${visita[0].data}?`)
    ) {
      VisitaService.deleteVisita(id).then(() => {
        this.setState({
          visitas: this.state.visitas.filter(visita => visita.id !== id),
        });
      });
    }
  };

  viewVisita = (id) => {
    this.props.history.push(`/ver-visita/${id}`);
  };

  render() {
    return (
      <div className="largura">
        <div className="titulo">Registro de Visitas</div>
        <div className="botao__cursor botao__novo" onClick={this.addVisita}><AddCircleOutlineIcon /> Registrar visita</div>
        <table className="tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>Apartamento</th>
              <th>Visitante</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {this.state.visitas.map(visita => (
              <tr key={visita.id}>
                <td data-title="Data">{visita.data}</td>
                <td data-title="Apartamento">{visita.apartamento}</td>
                <td data-title="Visitante">{visita.visitante}</td>
                <td>
                  <span className="tabela__acoes">
                    <DescriptionIcon className="tabela__icone" onClick={() => this.viewVisita(visita.id)} />
                    <EditIcon className="tabela__icone" onClick={() => this.putVisita(visita.id, visita.aptoId)} />
                    <DeleteIcon className="tabela__icone red" onClick={() => this.deleteVisita(visita.id)} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator 
          anterior={this.state.paginas.anterior}
          pagina={this.state.paginas.pagina} 
          proxima={this.state.paginas.proxima}
          limite={this.state.paginas.limite}
          total={this.state.paginas.total}
          onUpdate={this.coletarDados}
        />
      </div>
    );
  }
}

export default ListVisitaComponent;
